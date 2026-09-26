class ManulGame {
    constructor() {
        this.state = {
            isPlaying: false,
            isMoving: false,
            currentLocation: 0,
            progress: 0,
            locations: [
                { 
                    bg: 'img/bg_kreml.png',
                    landmark: 'img/kreml.png',
                    name: 'Кремль',
                    description: 'Московский Кремль — древнейшая часть Москвы, главный общественно-политический и историко-художественный комплекс города. Здесь находится официальная резиденция Президента России.'
                },
                { 
                    bg: 'img/bg_gora.png',
                    landmark: 'img/gora.png',
                    name: 'Горы',
                    description: 'Горы — величественные творения природы! Они покрыты снегом, а их вершины пронзают облака. В горах чистый воздух и живут удивительные животные.'
                },
                { 
                    bg: 'img/bg_parfenon.png',
                    landmark: 'img/parfenon.png',
                    name: 'Парфенон',
                    description: 'Парфенон — древнегреческий храм, построенный более 2400 лет назад в честь богини Афины. Это символ мудрости и культуры Древней Греции.'
                },
                { 
                    bg: 'img/bg_ostrov.png',
                    landmark: 'img/ostrov.png',
                    name: 'Остров',
                    description: 'Тропический остров — настоящий рай! Пальмы склонились над бирюзовой водой, а на песчаном пляже можно найти красивые ракушки и понаблюдать за крабами.'
                },
                { 
                    bg: 'img/bg_vigvam.png',
                    landmark: 'img/vigvam.png',
                    name: 'Вигвам',
                    description: 'Вигвам — традиционное жилище индейцев Северной Америки. Его делают из длинных шестов и шкур животных. Внутри тепло и уютно даже в холодную погоду!'
                }
            ]
        };

        this.smokeInterval = null;
        this.moveInterval = null;

        // Ждём полной загрузки DOM и инициализируем
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('Игра инициализирована');

        // DOM элементы сцены
        this.els = {
            startBtn: document.getElementById('startBtn'),
            startZone: document.getElementById('startZone'),
            actionZone: document.getElementById('actionZone'),
            blowBtn: document.getElementById('blowBtn'),
            progressFill: document.getElementById('progressFill'),
            trainWrapper: document.getElementById('trainWrapper'),
            bgImg: document.getElementById('bgImg'),
            smoke: document.getElementById('smoke'),
            scene: document.getElementById('scene')
        };

        // DOM элементы стартового попапа
        this.startPopup = {
            bg: document.getElementById('startPopupBg'),
            popup: document.getElementById('startPopup'),
            closeBtn: document.getElementById('closeStartPopup'),
            okBtn: document.getElementById('startPopupOk')
        };

        // DOM элементы попапа достопримечательности
        this.landmarkPopup = {
            bg: document.getElementById('landmarkPopupBg'),
            popup: document.getElementById('landmarkPopup'),
            closeBtn: document.getElementById('closeLandmarkPopup'),
            image: document.getElementById('landmarkImage'),
            title: document.getElementById('landmarkTitle'),
            description: document.getElementById('landmarkDescription'),
            okBtn: document.getElementById('landmarkOk')
        };

        // DOM элементы финального попапа
        this.finalPopup = {
            bg: document.getElementById('finalPopupBg'),
            popup: document.getElementById('finalPopup'),
            closeBtn: document.getElementById('closeFinalPopup'),
            image: document.getElementById('finalImage'),
            title: document.getElementById('finalTitle'),
            description: document.getElementById('finalDescription'),
            okBtn: document.getElementById('finalOk')
        };

        // Проверяем, что все элементы найдены
        if (!this.els.startBtn) {
            console.error('Кнопка startBtn не найдена!');
            return;
        }

        // Настраиваем обработчики попапов
        this.setupPopup(this.startPopup, () => this.startGame());
        this.setupPopup(this.landmarkPopup, () => this.nextLevel());
        this.setupPopup(this.finalPopup, () => location.reload());

        // Обработчики игры
        this.els.blowBtn.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            this.startMoving();
        });
        
        ['pointerup', 'pointercancel', 'pointerleave'].forEach(event => {
            this.els.blowBtn.addEventListener(event, () => this.stopMoving());
        });

        // Показываем стартовый попап
        this.openPopup(this.startPopup);
    }

    setupPopup(popup, onConfirm) {
        // Кнопка ОК
        popup.okBtn.addEventListener('click', () => {
            this.closePopup(popup);
            onConfirm();
        });

        // Крестик
        popup.closeBtn.addEventListener('click', () => {
            this.closePopup(popup);
        });

        // Клик по фону
        popup.bg.addEventListener('click', (e) => {
            if (e.target === popup.bg) {
                this.closePopup(popup);
                onConfirm();
            }
        });
    }

    openPopup(popup) {
        popup.bg.classList.add('active');
    }

    closePopup(popup) {
        popup.bg.classList.remove('active');
    }

    startGame() {
        console.log('Игра началась');
        this.els.startZone.style.display = 'none';
        this.els.actionZone.style.display = 'flex';
        this.state.isPlaying = true;
        this.loadLevel();
    }

    loadLevel() {
        const location = this.state.locations[this.state.currentLocation];
        this.els.bgImg.src = location.bg;
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
        clearInterval(this.smokeInterval);
        clearInterval(this.moveInterval);
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
        
        this.landmarkPopup.image.src = location.landmark;
        this.landmarkPopup.image.alt = location.name;
        this.landmarkPopup.title.textContent = location.name;
        this.landmarkPopup.description.textContent = location.description;
        
        this.openPopup(this.landmarkPopup);
    }

    nextLevel() {
        this.state.currentLocation++;

        if (this.state.currentLocation >= this.state.locations.length) {
            this.showFinal();
            return;
        }

        // Сброс прогресса и поезда
        this.state.progress = 0;
        this.els.progressFill.style.width = '0%';
        this.els.trainWrapper.style.left = '-200px';

        // Плавная смена фона
        this.els.bgImg.style.opacity = '0';
        setTimeout(() => {
            this.loadLevel();
            this.els.bgImg.onload = () => {
                this.els.bgImg.style.opacity = '1';
            };
        }, 500);
    }

    showFinal() {
        const lastLocation = this.state.locations[this.state.locations.length - 1];
        
        this.finalPopup.image.src = lastLocation.landmark;
        this.finalPopup.image.alt = lastLocation.name;
        this.finalPopup.title.textContent = ' Путешествие завершено!';
        this.finalPopup.description.textContent = `Ты помог Манулу добраться до ${lastLocation.name}! Молодец!`;
        
        this.openPopup(this.finalPopup);
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
}

// Запуск игры
new ManulGame();
