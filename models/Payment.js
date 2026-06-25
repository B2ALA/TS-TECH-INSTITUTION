const supabase = require('../config/db');

const Payment = {
    async createRecord(paymentData) {
        const { data, error } = await supabase
            .from('payments')
            .insert([{
                transaction_hash: paymentData.transactionHash,
                user_id: paymentData.userId,
                account_name: paymentData.accountName,
                course_id: paymentData.courseId,
                course_name: paymentData.courseName,
                payment_mode: paymentData.paymentMode,
                gross_amount: paymentData.grossAmount,
                status: 'completed'
            }])
            .select();

        if (error) throw error;
        return data[0];
    },

    async fetchUserLedger(userId) {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('user_id', userId)
            .order('transaction_timestamp', { ascending: false });

        if (error) throw error;
        return data;
    },

    async fetchGlobalAuditRegistry() {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .order('transaction_timestamp', { ascending: false });

        if (error) throw error;
        return data;
    }
};

module.exports = Payment;
