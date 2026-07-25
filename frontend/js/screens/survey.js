const questions = [
    { id: 'q1', text: "I felt comfortable during the conversation." },
    { id: 'q2', text: "The AI understood what I was saying." },
    { id: 'q3', text: "The AI's accent was easy to understand." },
    { id: 'q4', text: "The conversation felt natural and human-like." },
    { id: 'q5', text: "I felt a personal connection with the AI." },
    { id: 'q6', text: "I would enjoy having another conversation with this AI." },
    { id: 'q7', text: "The AI's speaking style matched my expectations." },
    { id: 'q8', text: "I felt the AI was intelligent and knowledgeable." }
];

function renderSurvey() {
    const container = document.getElementById('survey-questions-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    questions.forEach((q, index) => {
        const div = document.createElement('div');
        div.className = 'likert-question';
        
        div.innerHTML = `
            <h4>${index + 1}. ${q.text}</h4>
            <div class="likert-options" data-qid="${q.id}">
                ${[1,2,3,4,5].map(val => `
                    <div class="likert-option" data-value="${val}">
                        <div class="likert-dot"></div>
                        <div class="likert-label">${
                            val === 1 ? 'Strongly Disagree' : 
                            val === 5 ? 'Strongly Agree' : 
                            val === 3 ? 'Neutral' : ''
                        }</div>
                    </div>
                `).join('')}
            </div>
        `;
        
        container.appendChild(div);
    });
    
    // Add click listeners
    document.querySelectorAll('.likert-option').forEach(opt => {
        opt.addEventListener('click', function() {
            const parent = this.closest('.likert-options');
            parent.querySelectorAll('.likert-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            
            const qid = parent.getAttribute('data-qid');
            const val = parseInt(this.getAttribute('data-value'));
            AppState.surveyResponses[qid] = val;
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const btnSubmit = document.getElementById('btn-submit-survey');
    
    if (btnSubmit) {
        btnSubmit.addEventListener('click', async () => {
            // Check if all questions answered
            if (Object.keys(AppState.surveyResponses).length < questions.length) {
                alert("Please answer all rating questions before submitting.");
                return;
            }
            
            AppState.surveyResponses['thoughts'] = document.getElementById('survey-thoughts').value;
            
            // Submit Data
            const success = await DataCollector.submitSession(AppState);
            if (!success) {
                console.warn("Failed to sync, saved locally.");
            }
            
            navigateTo('thankyou');
        });
    }
});

window.addEventListener('screenChanged', (e) => {
    if (e.detail === 'survey') {
        renderSurvey();
    }
});
