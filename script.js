// --- STATE MANAGEMENT ---
const state = {
    user: {
        realName: '',
        email: '',
        maskedName: '',
        role: 'mentee', // 'mentee' or 'mentor'
    },
    signals: [
        {
            id: 1,
            author: 'GlobalGoober154',
            title: 'Calculus: Quotient rule in finding derivatives',
            desc: 'I keep getting confused when the denominator is a polynomial.',
            tags: ['Calculus', 'Math'],
            timeLeft: '24h 0m left',
            color: 'bg-cyan-500' 
        },
        {
            id: 2,
            author: 'GlobalHacker270',
            title: 'Help me with Physics',
            desc: 'I don\'t know physics. Specifically kinematics equations.',
            tags: ['Physics'],
            timeLeft: '23h 15m left',
            color: 'bg-teal-500'
        }
    ]
};

// --- AUTH & SETUP ---
const loginForm = document.getElementById('login-form');
const authOverlay = document.getElementById('auth-overlay');

const adjectives = ['Cosmic', 'Global', 'Neon', 'Quantum', 'Silent', 'Hyper'];
const nouns = ['Goober', 'Hacker', 'Scholar', 'Artist', 'Voyager', 'Panda'];

function generateMaskedName() {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 999);
    return `${adj}${noun}${num}`;
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email-input').value;
    const name = document.getElementById('name-input').value;
    const errorMsg = document.getElementById('email-error');

    // Strict CIIT Email Check
    if (!email.endsWith('@ciit.edu.ph')) {
        errorMsg.classList.remove('hidden');
        return;
    }

    state.user.email = email;
    state.user.realName = name;
    state.user.maskedName = generateMaskedName();
    
    document.getElementById('display-masked-name').textContent = state.user.maskedName;
    authOverlay.classList.add('hidden');
    renderSignals();
});

// --- MASK SYSTEM (Role Switching) ---
function toggleMask() {
    state.user.role = state.user.role === 'mentee' ? 'mentor' : 'mentee';
    
    const roleLabel = document.getElementById('current-role-label');
    const menteeAction = document.getElementById('mentee-action');
    const mentorAction = document.getElementById('mentor-action');
    const signalsNavLink = document.querySelector('header a:nth-child(3)');

    if (state.user.role === 'mentor') {
        roleLabel.textContent = 'Current: Mentor';
        roleLabel.classList.replace('text-gray-400', 'text-purple-600');
        
        menteeAction.classList.add('hidden');
        mentorAction.classList.remove('hidden');
        
        signalsNavLink.classList.replace('border-ciit-cyan', 'border-purple-600');
        signalsNavLink.classList.replace('text-ciit-cyan', 'text-purple-600');
    } else {
        roleLabel.textContent = 'Current: Mentee';
        roleLabel.classList.replace('text-purple-600', 'text-gray-400');

        mentorAction.classList.add('hidden');
        menteeAction.classList.remove('hidden');

        signalsNavLink.classList.replace('border-purple-600', 'border-ciit-cyan');
        signalsNavLink.classList.replace('text-purple-600', 'text-ciit-cyan');
    }
    
    renderSignals();
}

// --- FEED LOGIC ---
const feedContainer = document.getElementById('feed-container');

function renderSignals() {
    feedContainer.innerHTML = '';
    
    state.signals.forEach(signal => {
        const card = document.createElement('div');
        card.className = "bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition";
        
        const tagsHtml = signal.tags.map(tag => 
            `<span class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">${tag}</span>`
        ).join('');

        let actionButton = '';
        if (state.user.role === 'mentor') {
            actionButton = `<button onclick="requestToTeach('${signal.id}')" class="text-sm font-semibold text-purple-600 hover:text-purple-800 hover:underline">Request to Teach</button>`;
        } else {
            if (signal.author === state.user.maskedName) {
                actionButton = `<span class="text-xs text-gray-400">Posted by you</span>`;
            }
        }

        card.innerHTML = `
            <div class="flex items-start gap-4">
                <div class="h-10 w-10 ${signal.color || 'bg-cyan-500'} rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    ${signal.author.charAt(0)}
                </div>
                <div class="flex-1">
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <h4 class="font-bold text-gray-900">${signal.author}</h4>
                                <span class="bg-blue-100 text-blue-600 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">Student</span>
                            </div>
                            <h3 class="font-bold text-lg text-gray-800 mb-1">${signal.title}</h3>
                            <p class="text-gray-500 text-sm mb-3">${signal.desc}</p>
                        </div>
                        <div class="text-gray-300 cursor-pointer hover:text-gray-500">
                            <i class="fa-solid fa-ellipsis"></i>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between mt-2">
                        <div class="flex gap-2">
                            ${tagsHtml}
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between mt-4 border-t border-gray-50 pt-3">
                        <div class="flex items-center gap-2 text-xs text-gray-400">
                            <i class="fa-regular fa-clock"></i>
                            <span>${signal.timeLeft}</span>
                        </div>
                        ${actionButton}
                    </div>
                </div>
            </div>
        `;
        feedContainer.prepend(card);
    });
}

// --- POSTING SIGNALS ---
const modal = document.getElementById('signal-modal');

function openSignalModal() {
    modal.classList.remove('hidden');
}

function closeSignalModal() {
    modal.classList.add('hidden');
}

function handlePostSignal(e) {
    e.preventDefault();
    
    const title = document.getElementById('sig-title').value;
    const desc = document.getElementById('sig-desc').value;
    const tagsInput = document.getElementById('sig-tags').value;
    
    const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0);

    const newSignal = {
        id: Date.now(),
        author: state.user.maskedName,
        title: title,
        desc: desc,
        tags: tags.length ? tags : ['General'],
        timeLeft: 'Just now',
        color: 'bg-indigo-500'
    };

    state.signals.push(newSignal);
    renderSignals();
    e.target.reset();
    closeSignalModal();
}

function requestToTeach(id) {
    alert(`Request sent! In a real app, this opens a chat.`);
}