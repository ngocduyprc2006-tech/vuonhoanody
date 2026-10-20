(() => {
    'use strict';

    const {
        TAU,
        palettes,
        sprites,
        rgb,
        drawFlower,
        drawButterfly3D,
        drawBackground
    } = window.GardenBotany;

    const {
        DEFAULT_CARD,
        WRITING_HINTS,
        spawnFloatingWishes,
        enableSecurityLock,
        initRealCounters,
        renderLetterToDOM,
        getSavedLetters,
        saveLetterToLocal,
        clearSavedLetters,
        checkUrlCustomLetter,
        buildShareableLink
    } = window.CardController;

    enableSecurityLock();

    const canvas = document.getElementById('gardenCanvas');
    const ctx = canvas.getContext('2d', { alpha: false });

    const onlineNowCountEl = document.getElementById('onlineNowCount');
    const visitorCountEl = document.getElementById('visitorCount');
    const introPrompt = document.getElementById('introPrompt');
    const introMainTitle = document.getElementById('introMainTitle');
    const subtitleBottom = document.getElementById('subtitleBottom');
    const floatingWordsContainer = document.getElementById('floatingWordsContainer');

    const cardOverlay = document.getElementById('cardOverlay');
    const composeOverlay = document.getElementById('composeOverlay');
    const bottomControls = document.getElementById('bottomControls');

    const openCardDirectBtn = document.getElementById('openCardDirectBtn');
    const openComposeBtn = document.getElementById('openComposeBtn');
    const closeCardBtn = document.getElementById('closeCardBtn');
    const closeComposeBtn = document.getElementById('closeComposeBtn');

    const btnViewGarden = document.getElementById('btnViewGarden');
    const btnSwitchToCompose = document.getElementById('btnSwitchToCompose');
    const btnReadAgain = document.getElementById('btnReadAgain');
    const btnBottomCompose = document.getElementById('btnBottomCompose');
    const btnReplayBloom = document.getElementById('btnReplayBloom');

    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const fxToggleBtn = document.getElementById('fxToggleBtn');

    const customLetterForm = document.getElementById('customLetterForm');
    const hintPreviewBox = document.getElementById('hintPreviewBox');
    const inputRecipient = document.getElementById('inputRecipient');
    const inputTitle = document.getElementById('inputTitle');
    const inputMessage = document.getElementById('inputMessage');
    const inputSender = document.getElementById('inputSender');
    const inputTheme = document.getElementById('inputTheme');
    const charCounter = document.getElementById('charCounter');
    const btnClearForm = document.getElementById('btnClearForm');
    const btnPreviewLetter = document.getElementById('btnPreviewLetter');
    const shareResultBox = document.getElementById('shareResultBox');
    const generatedShareUrl = document.getElementById('generatedShareUrl');
    const btnCopyShareUrl = document.getElementById('btnCopyShareUrl');
    const savedLettersList = document.getElementById('savedLettersList');
    const savedCountLabel = document.getElementById('savedCountLabel');
    const btnClearSaved = document.getElementById('btnClearSaved');
    const toastNotify = document.getElementById('toastNotify');

    const random = Math.random;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let isMobile = width < 768;
    let dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);

    let isBlooming = false;
    let bloomStartTime = 0;
    let cardClosedManually = false;
    let cardTimer = null;
    let isDarkTheme = false;
    let isFxEnabled = true;
    let lastFrameTime = performance.now();

    let mouseX = 0,
        mouseY = 0;
    let targetMouseX = 0,
        targetMouseY = 0;

    const flowers = [];
    let heroFlower = null;
    const butterflies = [];
    const fireflies = [];
    const petals = [];
    const touchBurstPetals = [];
    const stars = [];
    const shootingStars = [];

    function showToast(msg) {
        if (!toastNotify) return;
        toastNotify.textContent = msg;
        toastNotify.classList.add('show');
        setTimeout(() => toastNotify.classList.remove('show'), 2600);
    }

    function applyTheme(dark) {
        isDarkTheme = Boolean(dark);
        document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
    }

    function updateCharCounter() {
        if (!charCounter || !inputMessage) return;
        charCounter.textContent = `${inputMessage.value.length} / 2500`;
    }

    function applyHintPlaceholders(hintKey) {
        const h = WRITING_HINTS[hintKey];
        if (!h) return;
        if (hintPreviewBox) hintPreviewBox.innerHTML = h.guide;
        if (inputRecipient) inputRecipient.placeholder = h.dearPlaceholder;
        if (inputTitle) inputTitle.placeholder = h.titlePlaceholder;
        if (inputMessage) inputMessage.placeholder = h.bodyPlaceholder;
        if (inputSender) inputSender.placeholder = h.signPlaceholder;
    }

    function clearComposeFormInputs() {
        if (customLetterForm) customLetterForm.reset();
        if (inputRecipient) inputRecipient.value = '';
        if (inputTitle) inputTitle.value = '';
        if (inputMessage) inputMessage.value = '';
        if (inputSender) inputSender.value = '';
        updateCharCounter();
    }

    function initGarden() {
        flowers.length = 0;
        for (let row = 0; row < 5; row++) {
            const count = isMobile ? (17 + row * 2) : (26 + row * 3);
            for (let i = 0; i < count; i++) {
                const x = (i + random() * 0.9) / count;
                flowers.push({
                    x,
                    y: 0.48 + row * 0.095 + (random() - 0.5) * 0.024,
                    depth: row,
                    radius: (isMobile ? 16 : 20) + row * 4.5 + random() * 9,
                    stem: 0.18 + random() * 0.22,
                    bend: (random() - 0.5) * 0.05,
                    phase: random() * TAU,
                    rotation: (random() - 0.5) * 0.75,
                    sprite: (i * 3 + row * 5 + Math.floor(random() * 3)) % sprites.length,
                    isBud: random() < 0.18,
                    delay: 0.15 + Math.abs(x - 0.5) * 3.4 + row * 0.25 + random() * 0.22,
                    duration: 1.15 + random() * 0.45
                });
            }
        }

        heroFlower = {
            x: 0.5,
            y: 0.41,
            depth: 5,
            radius: isMobile ? 54 : 68,
            stem: 0.56,
            bend: 0.012,
            phase: 0,
            rotation: 0,
            sprite: 0,
            isBud: false,
            delay: 0,
            duration: 0.95,
            isHero: true
        };
    }

    function initAtmosphere() {
        butterflies.length = 0;
        fireflies.length = 0;
        petals.length = 0;
        stars.length = 0;
        shootingStars.length = 0;

        const bCount = isMobile ? 6 : 11;
        const bColors = [
            [
                [244, 114, 182],
                [56, 189, 248]
            ],
            [
                [56, 189, 248],
                [192, 132, 252]
            ],
            [
                [251, 146, 60],
                [254, 205, 211]
            ],
            [
                [52, 211, 153],
                [250, 204, 21]
            ]
        ];
        for (let i = 0; i < bCount; i++) {
            const pair = bColors[i % bColors.length];
            butterflies.push({
                x: random(),
                y: 0.18 + random() * 0.54,
                vx: (random() - 0.5) * 0.035,
                phase: random() * TAU,
                flapSpeed: 13 + random() * 5,
                scale: (isMobile ? 0.65 : 0.82) + random() * 0.35,
                color1: pair[0],
                color2: pair[1]
            });
        }

        const fCount = isMobile ? 25 : 46;
        for (let i = 0; i < fCount; i++) {
            fireflies.push({
                x: random(),
                y: 0.18 + random() * 0.75,
                r: 1.8 + random() * 2.3,
                phase: random() * TAU,
                color: i % 2 === 0 ? '#f472b6' : '#38bdf8'
            });
        }

        const pCount = isMobile ? 22 : 38;
        for (let i = 0; i < pCount; i++) {
            petals.push({
                x: random(),
                y: random(),
                r: 2.2 + random() * 3.5,
                vx: 0.008 + random() * 0.015,
                vy: 0.006 + random() * 0.012,
                phase: random() * TAU,
                color: palettes[i % palettes.length].base
            });
        }

        const starCount = isMobile ? 55 : 95;
        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: random(),
                y: random(),
                r: 0.8 + random() * 1.8,
                phase: random() * TAU,
                speed: 1.5 + random() * 2.5
            });
        }

        for (let i = 0; i < 3; i++) {
            shootingStars.push({
                active: false,
                cooldown: i * 1.3 + 0.4,
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                len: 115,
                life: 0,
                maxLife: 0.8
            });
        }
    }

    function spawnTouchPetals(clientX, clientY) {
        if (!isFxEnabled) return;
        for (let i = 0; i < 10; i++) {
            const angle = random() * TAU;
            const speed = 60 + random() * 160;
            touchBurstPetals.push({
                x: clientX,
                y: clientY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 60,
                r: 3 + random() * 4,
                phase: random() * TAU,
                life: 1.2 + random() * 0.6,
                maxLife: 1.8,
                color: palettes[Math.floor(random() * palettes.length)].base
            });
        }
    }

    function render(now) {
        const dt = Math.min(0.05, (now - lastFrameTime) * 0.001);
        lastFrameTime = now;
        const time = now * 0.001;

        mouseX += (targetMouseX - mouseX) * 0.06;
        mouseY += (targetMouseY - mouseY) * 0.06;

        const env = { width, height, mouseX, mouseY, isDark: isDarkTheme };

        drawBackground(ctx, time, dt, env, isDarkTheme, stars, shootingStars, isFxEnabled);

        const elapsed = isBlooming ? (now - bloomStartTime) * 0.001 : 0;

        for (let d = 0; d < 5; d++) {
            for (let i = 0; i < flowers.length; i++) {
                const f = flowers[i];
                if (f.depth !== d) continue;
                const growth = isBlooming ? Math.max(0, Math.min(1, (elapsed - f.delay) / f.duration)) : 0;
                drawFlower(ctx, f, growth, time, env);
            }

            if (d === 3 && heroFlower) {
                const hGrowth = isBlooming ? 1 : Math.min(1, time * 0.95);
                const lift = isBlooming ? Math.min(1, elapsed / 2.2) * 0.03 : 0;
                drawFlower(ctx, {...heroFlower, y: heroFlower.y - lift }, hGrowth, time, env, isBlooming ? 0.8 : 0.45);
            }
        }

        if (isFxEnabled) {
            const bloomFactor = isBlooming ? Math.min(1, elapsed / 1.8) : 0.35;

            petals.forEach(pt => {
                pt.x += pt.vx * dt * 2.2 + Math.sin(time + pt.phase) * 0.0003;
                pt.y += pt.vy * dt * 2.2;
                if (pt.y > 1.05) pt.y = -0.05;
                if (pt.x > 1.05) pt.x = -0.05;

                ctx.save();
                ctx.translate(pt.x * width, pt.y * height);
                ctx.rotate(time * 1.1 + pt.phase);
                ctx.globalAlpha = 0.65 * bloomFactor;
                ctx.fillStyle = rgb(pt.color);
                ctx.beginPath();
                ctx.ellipse(0, 0, pt.r * 1.4, pt.r * 0.85, 0, 0, TAU);
                ctx.fill();
                ctx.restore();
            });

            if (isDarkTheme) {
                fireflies.forEach(ff => {
                    ff.x += Math.cos(time * 0.8 + ff.phase) * 0.0009;
                    ff.y += Math.sin(time * 1.2 + ff.phase) * 0.0007;
                    if (ff.x > 1.05) ff.x = -0.05;
                    if (ff.x < -0.05) ff.x = 1.05;

                    const alpha = (Math.sin(time * 3.2 + ff.phase) * 0.45 + 0.55) * bloomFactor;
                    ctx.save();
                    ctx.translate(ff.x * width, ff.y * height);
                    ctx.fillStyle = ff.color;
                    ctx.shadowColor = ff.color;
                    ctx.shadowBlur = 12;
                    ctx.globalAlpha = alpha;
                    ctx.beginPath();
                    ctx.arc(0, 0, ff.r, 0, TAU);
                    ctx.fill();
                    ctx.restore();
                });
            } else {
                butterflies.forEach(b => {
                    b.x += (0.018 + Math.cos(time * 0.7 + b.phase) * 0.01) * dt;
                    b.y += Math.sin(time * 1.4 + b.phase) * 0.015 * dt;
                    if (b.x > 1.08) b.x = -0.08;
                    if (b.y < 0.14) b.y = 0.14;
                    if (b.y > 0.76) b.y = 0.76;

                    drawButterfly3D(ctx, b, time, width, height, 0.92 * bloomFactor);
                });
            }

            for (let i = touchBurstPetals.length - 1; i >= 0; i--) {
                const tp = touchBurstPetals[i];
                tp.life -= dt;
                if (tp.life <= 0) {
                    touchBurstPetals.splice(i, 1);
                    continue;
                }
                tp.x += tp.vx * dt;
                tp.y += tp.vy * dt;
                tp.vy += 160 * dt;

                ctx.save();
                ctx.translate(tp.x, tp.y);
                ctx.rotate(time * 4 + tp.phase);
                ctx.globalAlpha = Math.max(0, tp.life / tp.maxLife);
                ctx.fillStyle = rgb(tp.color);
                ctx.beginPath();
                ctx.ellipse(0, 0, tp.r * 1.4, tp.r * 0.85, 0, 0, TAU);
                ctx.fill();
                ctx.restore();
            }
        }

        requestAnimationFrame(render);
    }

    function triggerBloom() {
        if (!isBlooming) {
            isBlooming = true;
            bloomStartTime = performance.now();

            introPrompt.classList.add('hidden');
            subtitleBottom.classList.add('show');
            spawnFloatingWishes(floatingWordsContainer);

            if (cardTimer) clearTimeout(cardTimer);
            cardTimer = setTimeout(() => {
                if (!cardClosedManually && !composeOverlay.classList.contains('active')) {
                    subtitleBottom.classList.remove('show');
                    cardOverlay.classList.add('active');
                }
            }, 3800);
        }
    }

    function fillComposeForm(data) {
        inputRecipient.value = data.dear || '';
        inputTitle.value = data.title || '';
        inputMessage.value = data.body || '';
        inputSender.value = data.sign || '';
        inputTheme.value = data.theme || (isDarkTheme ? 'dark' : 'light');
        updateCharCounter();
    }

    function getComposeFormData() {
        return {
            dear: inputRecipient.value.trim(),
            title: inputTitle.value.trim(),
            body: inputMessage.value.trim(),
            sign: inputSender.value.trim(),
            theme: inputTheme.value
        };
    }

    function renderSavedHistoryUI() {
        const list = getSavedLetters();
        if (savedCountLabel) savedCountLabel.textContent = String(list.length);
        if (!savedLettersList) return;

        savedLettersList.innerHTML = '';
        if (list.length === 0) {
            savedLettersList.innerHTML = '<div style="font-size:0.78rem;opacity:0.7;">Bạn chưa lưu bức thư nào trên thiết bị này.</div>';
            return;
        }

        list.forEach(item => {
            const row = document.createElement('div');
            row.className = 'saved-item';
            row.innerHTML = `
        <div class="saved-item-info"><strong>${item.dear}</strong> - ${item.title}</div>
        <button type="button" class="saved-item-btn">Nạp lại</button>
      `;
            row.querySelector('.saved-item-btn').addEventListener('click', () => {
                fillComposeForm(item);
                renderLetterToDOM(item);
                applyTheme(item.theme === 'dark');
                showToast('Đã nạp lại bức thư bạn lưu trước đó!');
            });
            savedLettersList.appendChild(row);
        });
    }

    canvas.addEventListener('click', e => {
        triggerBloom();
        spawnTouchPetals(e.clientX, e.clientY);
    });

    canvas.addEventListener('touchstart', e => {
        triggerBloom();
        if (e.touches.length > 0) {
            spawnTouchPetals(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    openCardDirectBtn.addEventListener('click', () => {
        triggerBloom();
        subtitleBottom.classList.remove('show');
        composeOverlay.classList.remove('active');
        cardOverlay.classList.add('active');
    });

    function openComposeModal() {
        triggerBloom();
        subtitleBottom.classList.remove('show');
        cardOverlay.classList.remove('active');
        shareResultBox.classList.remove('show');
        clearComposeFormInputs();
        renderSavedHistoryUI();
        composeOverlay.classList.add('active');
    }

    openComposeBtn.addEventListener('click', openComposeModal);
    btnSwitchToCompose.addEventListener('click', openComposeModal);
    btnBottomCompose.addEventListener('click', openComposeModal);

    closeCardBtn.addEventListener('click', () => {
        cardOverlay.classList.remove('active');
        cardClosedManually = true;
        bottomControls.classList.add('visible');
    });

    closeComposeBtn.addEventListener('click', () => {
        composeOverlay.classList.remove('active');
        cardClosedManually = true;
        bottomControls.classList.add('visible');
    });

    btnViewGarden.addEventListener('click', () => {
        cardOverlay.classList.remove('active');
        cardClosedManually = true;
        subtitleBottom.classList.remove('show');
        bottomControls.classList.add('visible');
    });

    btnReadAgain.addEventListener('click', () => {
        bottomControls.classList.remove('visible');
        cardOverlay.classList.add('active');
    });

    btnReplayBloom.addEventListener('click', () => {
        bottomControls.classList.remove('visible');
        cardOverlay.classList.remove('active');
        composeOverlay.classList.remove('active');
        cardClosedManually = false;
        initGarden();
        isBlooming = true;
        bloomStartTime = performance.now();
        subtitleBottom.classList.add('show');
        spawnFloatingWishes(floatingWordsContainer);
    });

    themeToggleBtn.addEventListener('click', () => {
        applyTheme(!isDarkTheme);
    });

    fxToggleBtn.addEventListener('click', () => {
        isFxEnabled = !isFxEnabled;
        fxToggleBtn.style.opacity = isFxEnabled ? '1' : '0.45';
        showToast(isFxEnabled ? 'Đã bật toàn bộ hiệu ứng Bướm & Sao băng!' : 'Đã bật chế độ tối ưu mượt cho máy yếu!');
    });

    document.querySelectorAll('.preset-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.preset-chip').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const hintKey = btn.getAttribute('data-hint');
            applyHintPlaceholders(hintKey);
        });
    });

    if (inputMessage) {
        inputMessage.addEventListener('input', updateCharCounter);
    }

    if (btnClearForm) {
        btnClearForm.addEventListener('click', () => {
            clearComposeFormInputs();
            shareResultBox.classList.remove('show');
            showToast('Đã làm trống toàn bộ ô nhập!');
        });
    }

    btnPreviewLetter.addEventListener('click', () => {
        const data = getComposeFormData();
        if (!data.dear || !data.title || !data.body || !data.sign) {
            showToast('Bạn hãy tự nhập đầy đủ các ô trước khi xem thử nhé!');
            return;
        }
        saveLetterToLocal(data);
        renderLetterToDOM(data);
        applyTheme(data.theme === 'dark');
        composeOverlay.classList.remove('active');
        cardOverlay.classList.add('active');
        showToast('Đã lưu và hiển thị bức thư bạn vừa tự viết!');
    });

    customLetterForm.addEventListener('submit', e => {
        e.preventDefault();
        const data = getComposeFormData();
        if (!data.dear || !data.title || !data.body || !data.sign) {
            showToast('Vui lòng tự viết đầy đủ lời chúc trước khi tạo link!');
            return;
        }
        saveLetterToLocal(data);
        renderLetterToDOM(data);
        applyTheme(data.theme === 'dark');

        const shareUrl = buildShareableLink(data);
        generatedShareUrl.value = shareUrl;
        shareResultBox.classList.add('show');
        renderSavedHistoryUI();
        showToast('Đã tạo Link gửi tặng thành công!');
    });

    btnCopyShareUrl.addEventListener('click', () => {
        if (!generatedShareUrl.value) return;
        navigator.clipboard.writeText(generatedShareUrl.value).then(() => {
            showToast('Đã sao chép Link! Hãy gửi ngay cho người thương nhé ♡');
        });
    });

    btnClearSaved.addEventListener('click', () => {
        clearSavedLetters();
        renderSavedHistoryUI();
        showToast('Đã xóa lịch sử thư lưu trên máy!');
    });

    window.addEventListener('mousemove', e => {
        targetMouseX = (e.clientX / width - 0.5) * 2;
        targetMouseY = (e.clientY / height - 0.5) * 2;
    });

    window.addEventListener('touchmove', e => {
        if (e.touches.length > 0) {
            targetMouseX = (e.touches[0].clientX / width - 0.5) * 2;
            targetMouseY = (e.touches[0].clientY / height - 0.5) * 2;
        }
    }, { passive: true });

    function handleResize() {
        width = window.innerWidth;
        height = window.innerHeight;
        isMobile = width < 768;
        dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    window.addEventListener('resize', handleResize);

    handleResize();
    initGarden();
    initAtmosphere();
    initRealCounters(onlineNowCountEl, visitorCountEl);

    // Luôn làm trống hoàn toàn các ô nhập khi mới vào trang
    clearComposeFormInputs();
    applyHintPlaceholders('mom');

    const sharedLetter = checkUrlCustomLetter();
    if (sharedLetter) {
        renderLetterToDOM(sharedLetter);
        applyTheme(sharedLetter.theme === 'dark');
        if (introMainTitle) {
            introMainTitle.textContent = sharedLetter.dear || 'Có một bức thư dành riêng cho bạn...';
        }
    } else {
        renderLetterToDOM(DEFAULT_CARD);
    }

    requestAnimationFrame(render);
})();