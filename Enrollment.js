const supabase = require('../config/db');

const Enrollment = {
    async getStudentEnrollments(userId) {
        const { data, error } = await supabase
            .from('enrollments')
            .select(`
                id,
                progress_percentage,
                enrolled_at,
                courses (
                    id,
                    title,
                    category,
                    description
                )
            `)
            .eq('user_id', userId);
        
        if (error) throw error;
        return data;
    },

    async registerNewEnrollment(userId, courseId) {
        // Initializes fresh progress tracking state values
        const { data, error } = await supabase
            .from('enrollments')
            .insert([{ 
                user_id: userId, 
                course_id: courseId,
                progress_percentage: 0 
            }])
            .select();
            
        if (error) throw error;
        return data[0];
    }
};

module.exports = User;
