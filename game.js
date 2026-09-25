class ManulGame {
    constructor() {
        this.state = {
            isPlaying: false,
            isMoving: false,
            currentLocation: 0,
            progress: 0,
            locations: [
                { 
                    name: 'Кремль', 
                    img: 'img/kreml.png',
                    description: 'Московский Кремль — древнейшая часть Москвы, главный общественно-политический и историко-художественный комплекс города. Здесь находится официальная резиденция Президента России.'
                },
                { 
                    name: 'Горы', 
                    img: 'img/gora.png',
                    description: 'Горы — величественные творения природы! Они покрыты снегом, а их вершины пронзают облака. В горах чистый воздух и живут удивительные животные.'
                },
                { 
                    name: 'Парфенон', 
                    img: 'img/parfenon.png',
                    description: 'Парфенон — древнегреческий храм, построенный более 2400 лет назад в честь богини Афины. Это символ мудрости и культуры Древней Греции.'
                },
                { 
                    name: 'Остров', 
                    img: 'img/ostrov.png',
                    description: 'Тропический остров — настоящий рай! Пальмы склонились над бирюзовой водой, а на песчаном пляже можно найти красивые ракушки и понаблюдать за крабами.'
                },
                { 
                    name: 'Вигвам', 
                    img: 'img/vigvam.png',
                    description: 'Вигвам — традиционное жилище индейцев Северной Америки. Его делают из длинных шестов и шкур животных. Внутри тепло и уютно даже в холодную погоду!'
                }
            ]
        };

        this.els = {
            startBtn: document.getElementById('startBtn'),
            instructionCard: document.getElementById('instructionCard'),
            actionZone: document.getElementById('actionZone'),
            blowBtn: document.getElementById('blowBtn'),
            progressFill: document.getElementById('progressFill'),
            trainWrapper: document.getElementById('trainWrapper'),
            bgImg: document.getElementById('bgImg'),
            smoke: document.getElementById('smoke'),
            scene: document.getElementById('scene'),
            landmarkOverlay: document.getElementById('landmarkOverlay'),
            landmarkCard: document.getElementById('landmarkCard'),
            landmarkImage: document.getElementById('landmarkImage'),
            landmarkTitle: document.getElementById('landmarkTitle'),
            landmarkDescription: document.getElementById('landmarkDescription'),
            continueBtn: document.getElementById('continueBtn')
        };

        this.init();
    }

    init() {
        this.els.startBtn.addEventListener('pointerdown', () => this.startGame());
        
        this.els.blowBtn.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            this.startMoving();
        });
        
        ['pointerup', 'pointercancel', 'pointerleave'].forEach(event => {
            this.els.blowBtn.addEventListener(event, () => this.stopMoving());
        });

        this.els.continueBtn.addEventListener('click', () => this.nextLocation());
    }

    startGame() {
        this.els.instructionCard.style.display = 'none';
        this.els.actionZone.style.display = 'flex';
        this.state.isPlaying = true;
    }

    startMoving() {
        if (!this.state.isPlaying) return;
        this.state.isMoving = true;
        this.els.blowBtn.classList.add('active');
        
        document.documentElement.style.setProperty('--train-speed', '0.5s');
        this.smokeInterval = setInterval(() => this.puffSmoke(), 300);
        this.moveInterval = setInterval(() => this.updateProgress(), 50);
    }

    stopMoving() {
        this.state.isMoving = false;
        this.els.blowBtn.classList.remove('active');
        
        document.documentElement.style.setProperty('--train-speed', '0s');
        clearInterval(this.moveInterval);
        clearInterval(this.smokeInterval);
    }

    updateProgress() {
        if (this.state.progress >= 100) {
            this.stopMoving();
            this.showLandmark();
            return;
        }

        this.state.progress += 1;
        this.els.progressFill.style.width = `${this.state.progress}%`;

        const sceneWidth = this.els.scene.offsetWidth;
        const trainWidth = this.els.trainWrapper.offsetWidth;
        const maxX = sceneWidth - trainWidth - 20;
        const currentX = (this.state.progress / 100) * maxX;
        
        this.els.trainWrapper.style.left = `${currentX}px`;
    }

    puffSmoke() {
        const smoke = this.els.smoke;
        smoke.style.animation = 'none';
        void smoke.offsetWidth;
        smoke.style.animation = 'puffSmoke 0.6s ease-out forwards';
    }

    showLandmark() {
        const location = this.state.locations[this.state.currentLocation];
        
        this.els.landmarkImage.src = location.img;
        this.els.landmarkImage.alt = location.name;
        this.els.landmarkTitle.textContent = location.name;
        this.els.landmarkDescription.textContent = location.description;
        
        this.els.landmarkOverlay.classList.add('active');
        
        this.createConfetti();
    }

    createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#ff9f43', '#a29bfe'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animation = `confettiFall ${2 + Math.random() * 2}s linear forwards`;
                
                this.els.scene.appendChild(confetti);
                
                setTimeout(() => confetti.remove(), 4000);
            }, i * 30);
        }
    }

    nextLocation() {
        this.els.landmarkOverlay.classList.remove('active');
        
        this.state.currentLocation++;

        if (this.state.currentLocation >= this.state.locations.length) {
            this.endGame();
            return;
        }

        this.state.progress = 0;
        this.els.progressFill.style.width = '0%';
        this.els.trainWrapper.style.left = '-150px';

        this.els.bgImg.style.opacity = '0';
        setTimeout(() => {
            this.els.bgImg.src = this.state.locations[this.state.currentLocation].img;
            this.els.bgImg.onload = () => {
                this.els.bgImg.style.opacity = '1';
            };
        }, 500);
    }

    endGame() {
        this.state.isPlaying = false;
        this.els.actionZone.innerHTML = `
            <h2 style="color: var(--secondary-color); text-align: center;">
                🎉 Ура! Путешествие завершено! <br> Манул доволен!
            </h2>
            <button class="btn btn-primary" onclick="location.reload()">Играть снова</button>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ManulGame();
});
