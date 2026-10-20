window.CardController = (() => {
    'use strict';

    const STORAGE_KEY_LETTERS = 'vuon_thuong_20_10_saved_letters_v5';
    const STORAGE_KEY_VISITS = 'vuon_thuong_20_10_zero_based_visits_v5';
    const STORAGE_KEY_SESSION_COUNTED = 'vuon_thuong_20_10_session_v5';

    // Xóa bỏ toàn bộ dữ liệu đếm cũ (1288, 1294...) còn lưu trong máy từ các bản trước
    try {
        localStorage.removeItem('vuon_thuong_20_10_visitor_count_v2');
        localStorage.removeItem('vuon_thuong_20_10_visitor_count_v3');
        localStorage.removeItem('vuon_thuong_20_10_real_visits_v4');
    } catch (_) {}

    const DEFAULT_CARD = {
        dear: 'Gửi những đóa hoa xinh đẹp nhất giữa đời thường,',
        title: 'Mong Mọi Điều Đẹp Đẽ Luôn Nở Rộ Bên Bạn',
        body: 'Một nhành hoa nhỏ có thể làm bừng sáng cả góc trời thu, còn nụ cười và sự dịu dàng của phái đẹp lại khiến cả thế gian này trở nên ấm áp, bình yên hơn biết bao nhiêu.\n\nGiữa những nhịp sống vội vã thường ngày, mong rằng hôm nay và cả những tháng ngày về sau, bạn luôn tìm thấy cho riêng mình những khoảng lặng thật êm đềm. Chúc bạn luôn đủ bình yên để tận hưởng những niềm vui giản dị, đủ rạng rỡ để đi qua mọi ngày nắng mưa và đủ tự tin để theo đuổi những giấc mơ của chính mình.\n\nHãy luôn yêu thương bản thân và giữ nụ cười tươi tắn trên môi nhé!',
        sign: 'Gửi ngàn hương sắc và những điều ngọt ngào nhất ♡',
        theme: 'light'
    };

    // Chỉ hiện gợi ý ý tưởng và chữ mờ (placeholder), tuyệt đối không điền sẵn văn mẫu vào ô
    const WRITING_HINTS = {
        mom: {
            guide: '💡 <strong>Gợi ý viết cho Mẹ:</strong> Bạn có thể nhắc về những bữa cơm ấm áp của Mẹ, cảm ơn Mẹ vì những hy sinh thầm lặng suốt bao năm qua và chúc Mẹ luôn khỏe mạnh, bình yên bên gia đình...',
            dearPlaceholder: 'Gợi ý: Gửi Mẹ yêu quý nhất của con,',
            titlePlaceholder: 'Gợi ý: Mong Mẹ Của Con Luôn Bình Yên & Khỏe Mạnh',
            bodyPlaceholder: 'Gợi ý: Mẹ ơi, nhân ngày 20/10 con muốn gửi đến Mẹ lời cảm ơn từ tận đáy lòng... (Bạn hãy tự gõ lời chúc của riêng mình vào đây nhé)',
            signPlaceholder: 'Gợi ý: Con của Mẹ ♡'
        },
        lover: {
            guide: '💡 <strong>Gợi ý viết cho Người yêu / Vợ:</strong> Hãy nhắc lại một kỷ niệm dễ thương giữa hai người, cảm ơn cô ấy vì đã luôn đồng hành, dịu dàng và chúc cô ấy mãi rạng rỡ...',
            dearPlaceholder: 'Gợi ý: Gửi em - cô gái mang theo nắng ấm,',
            titlePlaceholder: 'Gợi ý: Ngày 20/10 Ngọt Ngào Dành Riêng Cho Em',
            bodyPlaceholder: 'Gợi ý: Cảm ơn em vì đã đến, mang theo nụ cười làm dịu đi mọi mệt mỏi... (Bạn hãy tự gõ lời nhắn ngọt ngào của riêng mình nhé)',
            signPlaceholder: 'Gợi ý: Luôn thương em ♡'
        },
        crush: {
            guide: '💡 <strong>Gợi ý viết cho Crush / Bạn nữ:</strong> Khen ngợi nụ cười hoặc năng lượng tích cực của bạn ấy, chúc bạn ấy một ngày 20/10 ngập tràn niềm vui và những điều bất ngờ dễ thương...',
            dearPlaceholder: 'Gợi ý: Gửi cậu - người có nụ cười đẹp như nắng thu,',
            titlePlaceholder: 'Gợi ý: Chúc Cậu Ngày 20/10 Thật Nhiều Niềm Vui!',
            bodyPlaceholder: 'Gợi ý: Chúc cậu hôm nay nhận được thật nhiều hoa, nhiều quà và luôn giữ nụ cười rạng rỡ... (Bạn hãy tự gõ lời chúc chân thành vào đây nhé)',
            signPlaceholder: 'Gợi ý: Một người luôn quý mến cậu ♡'
        },
        sister: {
            guide: '💡 <strong>Gợi ý viết cho Chị / Em gái / Bạn bè:</strong> Gửi lời cảm ơn vì sự sẻ chia, chúc chị/em luôn xinh đẹp, tự tin tỏa sáng và đạt được mọi ước mơ trên con đường đã chọn...',
            dearPlaceholder: 'Gợi ý: Gửi Chị gái / Em gái thân yêu,',
            titlePlaceholder: 'Gợi ý: Chúc Ngày 20/10 Rạng Rỡ & Hạnh Phúc',
            bodyPlaceholder: 'Gợi ý: Nhân ngày 20/10, chúc chị/em luôn xinh đẹp, tươi trẻ và ngập tràn niềm vui... (Bạn hãy tự viết lời chúc tại đây nhé)',
            signPlaceholder: 'Gợi ý: Gửi ngàn lời chúc tốt đẹp ♡'
        }
    };

    const FLOATING_WISHES = [
        'Luôn bình yên nhé ✨',
        'Mãi rạng rỡ như hoa 🌸',
        'Ngập tràn hạnh phúc ♡',
        'Dịu dàng & Ngọt ngào 🌷',
        'Mỉm cười thật tươi nhé 😊',
        'Mọi điều đẹp đẽ bên bạn 💫'
    ];

    function spawnFloatingWishes(container) {
        if (!container) return;
        container.innerHTML = '';
        for (let i = 0; i < 6; i++) {
            const el = document.createElement('div');
            el.className = 'float-word';
            el.textContent = FLOATING_WISHES[i % FLOATING_WISHES.length];
            el.style.left = `${8 + Math.random() * 68}%`;
            el.style.bottom = `${14 + Math.random() * 25}%`;
            el.style.animationDelay = `${i * 0.55}s`;
            container.appendChild(el);
        }
    }

    function enableSecurityLock() {
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.addEventListener('dragstart', e => e.preventDefault());
        document.addEventListener('keydown', e => {
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) ||
                (e.ctrlKey && ['U', 'S', 'u', 's'].includes(e.key))
            ) {
                e.preventDefault();
                return false;
            }
        });
    }

    function encodePayload(obj) {
        const json = JSON.stringify(obj);
        return btoa(encodeURIComponent(json));
    }

    function decodePayload(str) {
        try {
            const json = decodeURIComponent(atob(str));
            return JSON.parse(json);
        } catch (_) {
            return null;
        }
    }

    // BỘ ĐẾM BẮT ĐẦU TỪ 0: Có người truy cập thật mới tăng từ 0 -> 1 -> 2...
    async function initRealCounters(onlineEl, totalVisitsEl) {
        if (totalVisitsEl) totalVisitsEl.textContent = '0';

        const hostKey = (window.location.hostname + '_' + window.location.pathname)
            .replace(/[^a-zA-Z0-9]/g, '_')
            .slice(0, 40) || 'local_garden_20_10';
        const namespace = `vn2010_zero_${hostKey}_v5`;
        const alreadyCountedSession = sessionStorage.getItem(STORAGE_KEY_SESSION_COUNTED);

        // Nếu chạy trên web thật (GitHub Pages / Vercel / Cloudflare), đồng bộ qua API bắt đầu từ 0
        if (window.location.protocol.startsWith('http') && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            try {
                const endpoint = alreadyCountedSession ?
                    `https://api.counterapi.dev/v1/${namespace}/visits` :
                    `https://api.counterapi.dev/v1/${namespace}/visits/up`;

                const res = await fetch(endpoint);
                if (res.ok) {
                    const data = await res.json();
                    const realCount = (data && typeof data.count === 'number') ? data.count : 1;
                    sessionStorage.setItem(STORAGE_KEY_SESSION_COUNTED, '1');
                    localStorage.setItem(STORAGE_KEY_VISITS, String(realCount));
                    if (totalVisitsEl) totalVisitsEl.textContent = realCount.toLocaleString('vi-VN');
                } else {
                    throw new Error('Fallback local');
                }
            } catch (_) {
                let localCount = parseInt(localStorage.getItem(STORAGE_KEY_VISITS) || '0', 10);
                if (!alreadyCountedSession) {
                    localCount += 1;
                    sessionStorage.setItem(STORAGE_KEY_SESSION_COUNTED, '1');
                    localStorage.setItem(STORAGE_KEY_VISITS, String(localCount));
                }
                if (totalVisitsEl) totalVisitsEl.textContent = localCount.toLocaleString('vi-VN');
            }
        } else {
            // Khi bạn mở test trên máy (localhost / file), đếm chuẩn từ 0 -> 1
            let localCount = parseInt(localStorage.getItem(STORAGE_KEY_VISITS) || '0', 10);
            if (!alreadyCountedSession) {
                localCount += 1;
                sessionStorage.setItem(STORAGE_KEY_SESSION_COUNTED, '1');
                localStorage.setItem(STORAGE_KEY_VISITS, String(localCount));
            }
            if (totalVisitsEl) totalVisitsEl.textContent = localCount.toLocaleString('vi-VN');
        }

        // Đếm số người đang mở trang cùng lúc (Đang online)
        const clientId = 'u_' + Math.random().toString(36).slice(2, 10);
        const peers = new Map();
        peers.set(clientId, Date.now());

        function updateOnlineUI() {
            const now = Date.now();
            for (const [id, lastSeen] of peers.entries()) {
                if (id !== clientId && now - lastSeen > 12000) {
                    peers.delete(id);
                }
            }
            if (onlineEl) {
                onlineEl.textContent = peers.size.toLocaleString('vi-VN');
            }
        }

        if ('BroadcastChannel' in window) {
            const bc = new BroadcastChannel('vuon_hoa_20_10_presence_v5');
            bc.onmessage = (ev) => {
                if (ev.data && ev.data.id) {
                    if (ev.data.type === 'leave') {
                        peers.delete(ev.data.id);
                    } else {
                        peers.set(ev.data.id, Date.now());
                    }
                    updateOnlineUI();
                }
            };
            setInterval(() => {
                peers.set(clientId, Date.now());
                bc.postMessage({ type: 'ping', id: clientId });
                updateOnlineUI();
            }, 3500);
            bc.postMessage({ type: 'ping', id: clientId });
            window.addEventListener('beforeunload', () => {
                bc.postMessage({ type: 'leave', id: clientId });
            });
        }
        updateOnlineUI();
    }

    function renderLetterToDOM(letterData) {
        const dearEl = document.getElementById('displayDear');
        const titleEl = document.getElementById('displayTitle');
        const bodyContainer = document.getElementById('displayBodyContainer');
        const signEl = document.getElementById('displaySign');

        if (dearEl) dearEl.textContent = letterData.dear || '';
        if (titleEl) titleEl.textContent = letterData.title || '';
        if (signEl) signEl.textContent = letterData.sign || '';

        if (bodyContainer) {
            bodyContainer.innerHTML = '';
            const paragraphs = String(letterData.body || '')
                .split(/\n+/)
                .map(s => s.trim())
                .filter(Boolean);

            paragraphs.forEach(text => {
                const p = document.createElement('p');
                p.className = 'card-body';
                p.textContent = text;
                bodyContainer.appendChild(p);
            });
        }
    }

    function getSavedLetters() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY_LETTERS);
            return raw ? JSON.parse(raw) : [];
        } catch (_) {
            return [];
        }
    }

    function saveLetterToLocal(letterData) {
        const list = getSavedLetters();
        const item = {
            ...letterData,
            id: Date.now(),
            createdAt: new Date().toLocaleDateString('vi-VN')
        };
        list.unshift(item);
        const trimmed = list.slice(0, 15);
        localStorage.setItem(STORAGE_KEY_LETTERS, JSON.stringify(trimmed));
        return trimmed;
    }

    function clearSavedLetters() {
        localStorage.removeItem(STORAGE_KEY_LETTERS);
    }

    function checkUrlCustomLetter() {
        const params = new URLSearchParams(window.location.search);
        const encoded = params.get('card');
        if (!encoded) return null;
        return decodePayload(encoded);
    }

    function buildShareableLink(letterData) {
        const code = encodePayload(letterData);
        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?card=${encodeURIComponent(code)}`;
    }

    return {
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
    };
})();