class DataCollector {
    static async submitSession(appState) {
        const payload = {
            participant_id: appState.participantId,
            demographics: appState.demographics,
            session: {
                dialect: appState.dialect,
                voice_gender: appState.voiceGender,
                duration_seconds: appState.sessionDuration,
                turn_count: appState.conversationHistory.length,
                started_at: appState.sessionStartTime,
                ended_at: new Date().toISOString()
            },
            conversation: appState.conversationHistory,
            survey: appState.surveyResponses
        };
        
        try {
            const response = await fetch(`${CONFIG.BACKEND_URL}/api/submit-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.json();
            return true;
        } catch (error) {
            console.error('Failed to submit session data:', error);
            // Store in localStorage as backup
            try {
                const backup = JSON.parse(localStorage.getItem('session_backup') || '[]');
                backup.push(payload);
                localStorage.setItem('session_backup', JSON.stringify(backup));
            } catch (e) {
                console.error("Failed to backup to localStorage", e);
            }
            return false;
        }
    }
}
