const Progress = require('../models/Progress');
const Cours = require('../models/Cours');
const QuizResult = require('../models/QuizResult');

/**
 * Récupérer la progression d'un étudiant
 */
const getProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Récupérer tous les cours où l'étudiant est inscrit
    const enrolledCourses = await Cours.find({ students: userId });
    
    // Récupérer les progressions
    const progresses = await Progress.find({
      utilisateur: userId,
      cours: { $in: enrolledCourses.map(c => c._id) }
    });
    
    // Calculer la progression globale
    let totalCompletedLessons = 0;
    let totalLessons = 0;
    
    const modules = enrolledCourses.map(course => {
      const progress = progresses.find(p => p.cours.toString() === course._id.toString());
      const completedLessons = progress?.completedLessons || 0;
      const totalCourseLessons = course.modules?.reduce((sum, m) => sum + (m.lecons?.length || 0), 0) || 0;
      
      totalCompletedLessons += completedLessons;
      totalLessons += totalCourseLessons;
      
      return {
        id: course._id,
        name: course.titre,
        progress: totalCourseLessons > 0 ? Math.round((completedLessons / totalCourseLessons) * 100) : 0,
        completed: completedLessons === totalCourseLessons,
        lessons: totalCourseLessons,
        completedLessons: completedLessons
      };
    });
    
    const overall = totalLessons > 0 ? Math.round((totalCompletedLessons / totalLessons) * 100) : 0;
    
    // Temps passé (à implémenter avec une collection d'activités)
    const timeSpent = '8h 30min';
    
    // Quiz réussis
    const successfulQuizzes = await QuizResult.countDocuments({
      utilisateur: userId,
      score: { $gte: 70 }
    });
    
    // Score moyen
    const quizResults = await QuizResult.find({ utilisateur: userId });
    const averageScore = quizResults.length > 0
      ? Math.round(quizResults.reduce((sum, q) => sum + q.score, 0) / quizResults.length)
      : 0;
    
    // Série de jours consécutifs
    const streak = 5;
    
    // Dernière activité
    const lastProgress = await Progress.findOne({ utilisateur: userId })
      .sort('-updatedAt');
    const lastActive = lastProgress?.updatedAt || new Date();
    
    res.json({
      success: true,
      data: {
        overall,
        completedLessons: totalCompletedLessons,
        totalLessons,
        timeSpent,
        successfulQuizzes,
        averageScore,
        streak,
        lastActive: new Date(lastActive).toLocaleDateString('fr-FR'),
        modules
      }
    });
  } catch (error) {
    console.error('Erreur getProgress:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Mettre à jour la progression d'une leçon
 */
const updateLessonProgress = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { completed, position, durationWatched } = req.body;
    const userId = req.user._id;
    
    let progress = await Progress.findOne({
      utilisateur: userId,
      cours: courseId
    });
    
    if (!progress) {
      progress = new Progress({
        utilisateur: userId,
        cours: courseId,
        completedLessons: [],
        progress: 0,
        currentLesson: lessonId,
        currentPosition: position || 0
      });
    }
    
    // Mettre à jour la leçon
    if (completed && !progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }
    
    // Mettre à jour la position
    if (position !== undefined) {
      progress.currentPosition = position;
    }
    progress.currentLesson = lessonId;
    
    // Calculer la progression
    const course = await Cours.findById(courseId);
    const totalLessons = course.modules?.reduce((sum, m) => sum + (m.lecons?.length || 0), 0) || 0;
    progress.progress = totalLessons > 0 
      ? Math.round((progress.completedLessons.length / totalLessons) * 100)
      : 0;
    
    await progress.save();
    
    res.json({
      success: true,
      data: progress,
      message: 'Progression mise à jour'
    });
  } catch (error) {
    console.error('Erreur updateLessonProgress:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Récupérer la progression d'un cours spécifique
 */
const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;
    
    const progress = await Progress.findOne({
      utilisateur: userId,
      cours: courseId
    });
    
    const course = await Cours.findById(courseId);
    const totalLessons = course.modules?.reduce((sum, m) => sum + (m.lecons?.length || 0), 0) || 0;
    
    res.json({
      success: true,
      data: {
        progress: progress?.progress || 0,
        completedLessons: progress?.completedLessons || [],
        totalLessons,
        currentLesson: progress?.currentLesson,
        currentPosition: progress?.currentPosition || 0,
        lastWatched: progress?.updatedAt
      }
    });
  } catch (error) {
    console.error('Erreur getCourseProgress:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getProgress,
  updateLessonProgress,
  getCourseProgress
};