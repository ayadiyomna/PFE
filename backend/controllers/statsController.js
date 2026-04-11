const User = require('../models/User');
const Cours = require('../models/Cours');
const mongoose = require('mongoose');

/**
 * Statistiques pour l'administrateur
 */
const getAdminStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'etudiant' });
    const totalTeachers = await User.countDocuments({ role: 'enseignant' });
    const totalCourses = await Cours.countDocuments();
    
    // Revenus totaux (somme des prix des cours * nombre d'étudiants inscrits)
    const courses = await Cours.find({ status: 'Publié' });
    const totalRevenue = courses.reduce((sum, course) => {
      return sum + (course.prix * (course.students?.length || 0));
    }, 0);
    
    // Demandes en attente (enseignants en attente de validation)
    const pendingRequests = await User.countDocuments({ 
      role: 'enseignant', 
      status: 'en_attente' 
    });
    
    res.json({
      success: true,
      data: {
        totalStudents,
        totalTeachers,
        totalCourses,
        totalRevenue,
        pendingRequests
      }
    });
  } catch (error) {
    console.error('Erreur getAdminStats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Statistiques pour un enseignant
 */
const getTeacherStats = async (req, res) => {
  try {
    const teacherId = req.user._id;
    
    // Cours de l'enseignant
    const courses = await Cours.find({ instructeur: teacherId });
    
    const totalCourses = courses.length;
    const totalStudents = courses.reduce((sum, course) => sum + (course.students?.length || 0), 0);
    
    // Progression moyenne des étudiants sur les cours
    let totalProgress = 0;
    let progressCount = 0;
    
    // Récupérer la progression depuis la collection des progressions
    const Progress = mongoose.model('Progress');
    for (const course of courses) {
      const progress = await Progress.find({ 
        cours: course._id,
        utilisateur: { $in: course.students || [] }
      });
      totalProgress += progress.reduce((sum, p) => sum + (p.progress || 0), 0);
      progressCount += progress.length;
    }
    
    const averageProgress = progressCount > 0 
      ? Math.round(totalProgress / progressCount) 
      : 0;
    
    // Revenus
    const revenue = courses.reduce((sum, course) => {
      return sum + (course.prix * (course.students?.length || 0));
    }, 0);
    
    // Avis en attente (à implémenter selon vos besoins)
    const pendingReviews = 0;
    
    res.json({
      success: true,
      data: {
        totalStudents,
        totalCourses,
        averageProgress,
        revenue,
        pendingReviews
      }
    });
  } catch (error) {
    console.error('Erreur getTeacherStats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Statistiques pour un étudiant
 */
const getStudentStats = async (req, res) => {
  try {
    const studentId = req.user._id;
    
    // Cours auxquels l'étudiant est inscrit
    const courses = await Cours.find({ students: studentId });
    
    const enrolledCourses = courses.length;
    let completedCourses = 0;
    let totalHours = 0;
    
    // Récupérer la progression
    const Progress = mongoose.model('Progress');
    let totalProgress = 0;
    
    for (const course of courses) {
      const progress = await Progress.findOne({ 
        cours: course._id, 
        utilisateur: studentId 
      });
      
      const progressPercent = progress?.progress || 0;
      totalProgress += progressPercent;
      
      if (progressPercent === 100) {
        completedCourses++;
      }
      
      totalHours += course.dureeTotale || 0;
    }
    
    const averageScore = enrolledCourses > 0 
      ? Math.round(totalProgress / enrolledCourses) 
      : 0;
    
    // Nombre de certificats
    const Certificat = mongoose.model('Certificat');
    const certificates = await Certificat.countDocuments({ 
      utilisateur: studentId 
    });
    
    // Prochaine leçon
    let nextLesson = null;
    for (const course of courses) {
      const progress = await Progress.findOne({ 
        cours: course._id, 
        utilisateur: studentId 
      });
      
      if (progress && progress.currentLesson) {
        nextLesson = {
          courseId: course._id,
          courseTitle: course.titre,
          lessonId: progress.currentLesson
        };
        break;
      }
    }
    
    res.json({
      success: true,
      data: {
        enrolledCourses,
        completedCourses,
        totalHours,
        certificates,
        averageScore,
        nextLesson
      }
    });
  } catch (error) {
    console.error('Erreur getStudentStats:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Activités récentes
 */
const getRecentActivities = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    
    let activities = [];
    
    if (role === 'administrateur') {
      // Dernières inscriptions
      const recentUsers = await User.find()
        .sort('-createdAt')
        .limit(5);
      
      activities = recentUsers.map(user => ({
        id: user._id,
        type: 'inscription',
        user: `${user.prenom} ${user.nom}`,
        action: `s'est inscrit`,
        time: getTimeAgo(user.createdAt)
      }));
      
      // Derniers cours créés
      const recentCourses = await Cours.find()
        .populate('instructeur', 'nom prenom')
        .sort('-createdAt')
        .limit(3);
      
      const courseActivities = recentCourses.map(course => ({
        id: course._id,
        type: 'cours',
        user: `${course.instructeur?.prenom} ${course.instructeur?.nom}`,
        action: `a créé le cours "${course.titre}"`,
        time: getTimeAgo(course.createdAt)
      }));
      
      activities = [...activities, ...courseActivities].slice(0, 5);
      
    } else if (role === 'enseignant') {
      // Activités liées aux cours de l'enseignant
      const teacherCourses = await Cours.find({ instructeur: userId });
      const courseIds = teacherCourses.map(c => c._id);
      
      const Progress = mongoose.model('Progress');
      const recentProgress = await Progress.find({ 
        cours: { $in: courseIds } 
      })
      .populate('utilisateur', 'nom prenom')
      .sort('-updatedAt')
      .limit(5);
      
      activities = recentProgress.map(progress => ({
        id: progress._id,
        type: 'student',
        message: `${progress.utilisateur?.prenom} ${progress.utilisateur?.nom} a atteint ${progress.progress}% de progression`,
        time: getTimeAgo(progress.updatedAt)
      }));
      
    } else if (role === 'etudiant') {
      // Activités de l'étudiant
      const Progress = mongoose.model('Progress');
      const studentProgress = await Progress.find({ utilisateur: userId })
        .populate('cours', 'titre')
        .sort('-updatedAt')
        .limit(5);
      
      activities = studentProgress.map(progress => ({
        id: progress._id,
        type: progress.progress === 100 ? 'certificate' : 'course',
        message: progress.progress === 100 
          ? `Vous avez terminé le cours "${progress.cours?.titre}"`
          : `Vous avez complété ${progress.progress}% du cours "${progress.cours?.titre}"`,
        time: getTimeAgo(progress.updatedAt)
      }));
    }
    
    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Erreur getRecentActivities:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Helper pour formater le temps
 */
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  if (seconds < 60) return `il y a ${seconds} sec`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days} jours`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `il y a ${weeks} sem`;
  const months = Math.floor(days / 30);
  return `il y a ${months} mois`;
}

module.exports = {
  getAdminStats,
  getTeacherStats,
  getStudentStats,
  getRecentActivities
};