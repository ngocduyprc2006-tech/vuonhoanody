window.GardenBotany = (() => {
    'use strict';

    const TAU = Math.PI * 2;

    const palettes = [
        { name: 'pink-velvet', type: 'rose', base: [244, 114, 182], inner: [190, 24, 93], outer: [251, 207, 232], edge: [253, 242, 248] },
        { name: 'crimson-rose', type: 'rose', base: [225, 29, 72], inner: [136, 19, 55], outer: [251, 113, 133], edge: [255, 228, 230] },
        { name: 'coral-sunset', type: 'rose', base: [251, 113, 133], inner: [190, 18, 60], outer: [254, 205, 211], edge: [255, 241, 242] },
        { name: 'peach-dream', type: 'rose', base: [251, 146, 60], inner: [194, 65, 12], outer: [254, 215, 170], edge: [255, 247, 237] },
        { name: 'golden-amber', type: 'rose', base: [250, 204, 21], inner: [180, 83, 9], outer: [254, 240, 138], edge: [254, 252, 232] },
        { name: 'lavender-mist', type: 'rose', base: [192, 132, 252], inner: [107, 33, 168], outer: [233, 213, 255], edge: [250, 245, 255] },
        { name: 'sky-crystal', type: 'rose', base: [56, 189, 248], inner: [3, 105, 161], outer: [186, 230, 253], edge: [240, 249, 255] },
        { name: 'emerald-mint', type: 'rose', base: [52, 211, 153], inner: [4, 120, 87], outer: [167, 243, 208], edge: [236, 253, 245] },
        { name: 'ivory-cream', type: 'rose', base: [248, 235, 220], inner: [214, 180, 150], outer: [255, 250, 245], edge: [255, 255, 255] },
        { name: 'magenta-queen', type: 'rose', base: [217, 70, 239], inner: [134, 25, 143], outer: [245, 208, 254], edge: [253, 244, 255] },
        { name: 'salmon-rose', type: 'rose', base: [248, 113, 113], inner: [185, 28, 28], outer: [254, 202, 202], edge: [254, 242, 242] },
        { name: 'periwinkle', type: 'rose', base: [129, 140, 248], inner: [67, 56, 202], outer: [199, 210, 254], edge: [238, 242, 255] },
        { name: 'ruby-tulip', type: 'tulip', base: [239, 68, 68], inner: [153, 27, 27], outer: [252, 165, 165], edge: [254, 242, 242] },
        { name: 'sun-tulip', type: 'tulip', base: [250, 204, 21], inner: [202, 138, 4], outer: [254, 240, 138], edge: [254, 252, 232] },
        { name: 'violet-tulip', type: 'tulip', base: [168, 85, 247], inner: [107, 33, 168], outer: [216, 180, 254], edge: [250, 245, 255] },
        { name: 'princess-tulip', type: 'tulip', base: [236, 72, 153], inner: [157, 23, 77], outer: [249, 168, 212], edge: [253, 242, 248] }
    ];

    const whorlDelays = [0, 0.11, 0.22, 0.32];
    const closedScales = [0.42, 0.35, 0.28, 0.38];
    const twistAngles = [0.48, -0.72, 0.96, -1.25];

    function rgb(arr, alpha = 1) {
        return `rgba(${arr[0]},${arr[1]},${arr[2]},${alpha})`;
    }

    function lerpColor(c1, c2, t) {
        return [
            Math.round(c1[0] + (c2[0] - c1[0]) * t),
            Math.round(c1[1] + (c2[1] - c1[1]) * t),
            Math.round(c1[2] + (c2[2] - c1[2]) * t)
        ];
    }

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function easeOutBack(t) {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    }

    function quadPoint(x0, y0, cx, cy, x1, y1, t) {
        const inv = 1 - t;
        return {
            x: inv * inv * x0 + 2 * inv * t * cx + t * t * x1,
            y: inv * inv * y0 + 2 * inv * t * cy + t * t * y1
        };
    }

    function quadTangent(x0, y0, cx, cy, x1, y1, t) {
        return {
            dx: 2 * (1 - t) * (cx - x0) + 2 * t * (x1 - cx),
            dy: 2 * (1 - t) * (cy - y0) + 2 * t * (y1 - cy)
        };
    }

    function createFlowerSprite(palette, isBud = false) {
        const size = isBud ? 130 : 240;
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const g = c.getContext('2d');
        const cx = size / 2;
        const cy = size / 2;

        if (isBud) {
            g.save();
            g.translate(cx, cy + 6);

            const budGrad = g.createLinearGradient(0, -32, 0, 22);
            budGrad.addColorStop(0, rgb(palette.edge));
            budGrad.addColorStop(0.5, rgb(palette.base));
            budGrad.addColorStop(1, rgb(palette.inner));

            g.fillStyle = budGrad;
            g.beginPath();
            g.moveTo(0, -32);
            g.bezierCurveTo(22, -16, 20, 18, 0, 24);
            g.bezierCurveTo(-20, 18, -22, -16, 0, -32);
            g.fill();

            g.strokeStyle = rgb(palette.edge, 0.75);
            g.lineWidth = 1.2;
            g.beginPath();
            g.moveTo(-3, -25);
            g.quadraticCurveTo(10, -4, 2, 18);
            g.stroke();

            g.fillStyle = '#2d6a4f';
            g.beginPath();
            g.moveTo(0, 24);
            g.quadraticCurveTo(-18, 12, -14, -8);
            g.quadraticCurveTo(-5, 8, 0, 20);
            g.fill();

            g.beginPath();
            g.moveTo(0, 24);
            g.quadraticCurveTo(18, 12, 14, -8);
            g.quadraticCurveTo(5, 8, 0, 20);
            g.fill();

            g.restore();
            return c;
        }

        const glow = g.createRadialGradient(cx, cy, 8, cx, cy, size * 0.46);
        glow.addColorStop(0, rgb(palette.inner, 0.28));
        glow.addColorStop(0.65, rgb(palette.base, 0.1));
        glow.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = glow;
        g.beginPath();
        g.arc(cx, cy, size * 0.46, 0, TAU);
        g.fill();

        if (palette.type === 'rose') {
            const rings = [
                { count: 10, radius: 80, pW: 52, pL: 55, t: 0.05 },
                { count: 9, radius: 67, pW: 45, pL: 47, t: 0.18 },
                { count: 8, radius: 54, pW: 39, pL: 40, t: 0.34 },
                { count: 7, radius: 41, pW: 32, pL: 33, t: 0.50 },
                { count: 6, radius: 29, pW: 25, pL: 26, t: 0.68 },
                { count: 5, radius: 18, pW: 18, pL: 19, t: 0.84 },
                { count: 4, radius: 9, pW: 11, pL: 12, t: 0.96 }
            ];

            rings.forEach((ring, rIdx) => {
                const midCol = lerpColor(palette.outer, palette.inner, ring.t);
                const tipCol = lerpColor(palette.edge, palette.base, ring.t * 0.6);
                const deepCol = lerpColor(palette.base, palette.inner, Math.min(1, ring.t + 0.25));

                for (let i = 0; i < ring.count; i++) {
                    const angle = (i / ring.count) * TAU + rIdx * 0.5;
                    g.save();
                    g.translate(cx, cy);
                    g.rotate(angle);

                    g.shadowColor = rgb(palette.inner, 0.22);
                    g.shadowBlur = 7;
                    g.shadowOffsetY = 2;

                    const pGrad = g.createRadialGradient(0, -ring.radius * 0.35, 2, 0, -ring.radius * 0.7, ring.pL * 1.12);
                    pGrad.addColorStop(0, rgb(deepCol));
                    pGrad.addColorStop(0.6, rgb(midCol));
                    pGrad.addColorStop(1, rgb(tipCol));
                    g.fillStyle = pGrad;

                    const w = ring.pW;
                    const l = ring.pL;
                    const y0 = -ring.radius + l * 0.45;
                    const yTip = -ring.radius - l * 0.55;

                    g.beginPath();
                    g.moveTo(0, y0);
                    g.bezierCurveTo(-w * 0.88, y0 - l * 0.25, -w * 0.96, yTip + l * 0.25, -w * 0.18, yTip);
                    g.quadraticCurveTo(0, yTip - l * 0.07, w * 0.18, yTip);
                    g.bezierCurveTo(w * 0.96, yTip + l * 0.25, w * 0.88, y0 - l * 0.25, 0, y0);
                    g.closePath();
                    g.fill();

                    g.shadowColor = 'transparent';
                    g.strokeStyle = rgb(palette.edge, 0.75);
                    g.lineWidth = 1.1;
                    g.stroke();
                    g.restore();
                }
            });

            const cGrad = g.createRadialGradient(cx, cy, 1, cx, cy, 11);
            cGrad.addColorStop(0, '#fde047');
            cGrad.addColorStop(0.45, rgb(palette.inner));
            cGrad.addColorStop(1, rgb(palette.base));
            g.fillStyle = cGrad;
            g.beginPath();
            g.arc(cx, cy, 8, 0, TAU);
            g.fill();
        } else {
            g.save();
            g.translate(cx, cy + 20);

            g.shadowColor = rgb(palette.inner, 0.24);
            g.shadowBlur = 8;

            g.fillStyle = rgb(palette.inner);
            g.beginPath();
            g.ellipse(-10, -30, 22, 44, -0.18, 0, TAU);
            g.ellipse(10, -30, 22, 44, 0.18, 0, TAU);
            g.fill();

            const gradL = g.createLinearGradient(-40, -42, 0, 18);
            gradL.addColorStop(0, rgb(palette.edge));
            gradL.addColorStop(0.55, rgb(palette.outer));
            gradL.addColorStop(1, rgb(palette.base));
            g.fillStyle = gradL;
            g.beginPath();
            g.moveTo(0, 20);
            g.bezierCurveTo(-48, 15, -52, -42, -26, -64);
            g.bezierCurveTo(-13, -70, -3, -44, 0, -12);
            g.closePath();
            g.fill();

            const gradR = g.createLinearGradient(0, -42, 40, 18);
            gradR.addColorStop(0, rgb(palette.edge));
            gradR.addColorStop(0.55, rgb(palette.outer));
            gradR.addColorStop(1, rgb(palette.base));
            g.fillStyle = gradR;
            g.beginPath();
            g.moveTo(0, 20);
            g.bezierCurveTo(48, 15, 52, -42, 26, -64);
            g.bezierCurveTo(13, -70, 3, -44, 0, -12);
            g.closePath();
            g.fill();

            const gradM = g.createLinearGradient(0, -68, 0, 24);
            gradM.addColorStop(0, rgb(palette.edge));
            gradM.addColorStop(0.45, rgb(palette.base));
            gradM.addColorStop(1, rgb(palette.inner));
            g.fillStyle = gradM;
            g.beginPath();
            g.moveTo(0, 24);
            g.bezierCurveTo(-38, 20, -40, -38, 0, -66);
            g.bezierCurveTo(40, -38, 38, 20, 0, 24);
            g.closePath();
            g.fill();

            g.strokeStyle = rgb(palette.edge, 0.8);
            g.lineWidth = 1.2;
            g.stroke();

            g.restore();
        }

        return c;
    }

    const sprites = palettes.map(p => createFlowerSprite(p, false));
    const budSprites = palettes.map(p => createFlowerSprite(p, true));

    function drawLeaf(ctx, x, y, angle, size, alpha, depthRatio, isDark) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.globalAlpha = alpha;

        const grad = ctx.createLinearGradient(0, 0, size, 0);
        if (isDark) {
            grad.addColorStop(0, depthRatio > 0.5 ? '#133c2b' : '#1f543d');
            grad.addColorStop(1, depthRatio > 0.5 ? '#246a4d' : '#3a8f6b');
        } else {
            grad.addColorStop(0, depthRatio > 0.5 ? '#1b4332' : '#2d6a4f');
            grad.addColorStop(1, depthRatio > 0.5 ? '#40916c' : '#52b788');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(size * 0.45, -size * 0.36, size, 0);
        ctx.quadraticCurveTo(size * 0.45, size * 0.36, 0, 0);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(255,255,255,0.26)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(2, 0);
        ctx.lineTo(size * 0.78, 0);
        ctx.stroke();

        ctx.restore();
    }

    function drawFlower(ctx, flower, growth, time, env, swayMultiplier = 1) {
        if (growth <= 0.001) return;

        const { width, height, mouseX, mouseY, isDark } = env;
        const depthRatio = flower.depth / 5;
        const screenScale = Math.max(0.68, Math.min(width, height) / 860);
        const flowerRadius = flower.radius * screenScale;

        const wind = Math.sin(time * 1.65 + flower.phase + flower.x * 5) * (5 + flower.depth * 2) * swayMultiplier;
        const parallaxX = mouseX * (flower.depth + 1) * 7;

        const baseX = flower.x * width + parallaxX * 0.35;
        const baseY = height + 26;
        const fullHeadX = flower.x * width + flower.bend * width + wind + parallaxX;
        const fullHeadY = flower.y * height + mouseY * flower.depth * 2.5;

        const stemProgress = easeOutCubic(Math.min(1, growth * 1.25));
        const headX = baseX + (fullHeadX - baseX) * stemProgress;
        const headY = baseY + (fullHeadY - baseY) * stemProgress;
        const ctrlX = (baseX + headX) * 0.5 - flower.bend * width * 0.35 + wind * 0.35;
        const ctrlY = (baseY + headY) * 0.5;

        const baseAlpha = flower.isHero ? 1 : (0.58 + depthRatio * 0.42) * Math.min(1, growth * 1.8);

        ctx.save();
        ctx.globalAlpha = baseAlpha;

        ctx.strokeStyle = isDark ?
            (depthRatio > 0.5 ? '#1b4d37' : '#2c6e51') :
            (depthRatio > 0.5 ? '#22543d' : '#38a169');
        ctx.lineWidth = (flower.isHero ? 4.2 : (1.5 + flower.depth * 0.48)) * screenScale;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.quadraticCurveTo(ctrlX, ctrlY, headX, headY);
        ctx.stroke();

        if (stemProgress > 0.35) {
            const leafScale = easeOutBack(Math.min(1, (stemProgress - 0.35) / 0.65));
            const leafSize = (flower.isHero ? 34 : (14 + flower.depth * 2.8)) * leafScale * screenScale;

            const p1 = quadPoint(baseX, baseY, ctrlX, ctrlY, headX, headY, 0.58);
            drawLeaf(ctx, p1.x, p1.y, -0.58 + Math.sin(time * 2 + flower.phase) * 0.08, leafSize, baseAlpha, depthRatio, isDark);

            const p2 = quadPoint(baseX, baseY, ctrlX, ctrlY, headX, headY, 0.35);
            drawLeaf(ctx, p2.x, p2.y, Math.PI + 0.58 + Math.sin(time * 2 + flower.phase + 1) * 0.08, leafSize * 0.85, baseAlpha, depthRatio, isDark);
        }

        const tangent = quadTangent(baseX, baseY, ctrlX, ctrlY, headX, headY, 1);
        const headAngle = Math.atan2(tangent.dy, tangent.dx) + Math.PI / 2;

        ctx.translate(headX, headY);
        ctx.rotate(headAngle * 0.22 + flower.rotation * 0.12);

        if (flower.isBud) {
            const budScale = easeOutBack(Math.min(1, Math.max(0, (growth - 0.12) / 0.88)));
            const r = flowerRadius * 0.88 * budScale;
            ctx.drawImage(budSprites[flower.sprite], -r, -r, r * 2, r * 2);
        } else {
            const sprite = sprites[flower.sprite];
            for (let w = 0; w < 4; w++) {
                const wDelay = whorlDelays[w];
                const wProgress = Math.max(0, Math.min(1, (growth - wDelay) / (1 - wDelay)));
                if (wProgress <= 0) continue;

                const easedW = easeOutBack(wProgress);
                const scale = closedScales[w] + (1 - closedScales[w]) * easedW;
                const twist = (1 - easeOutCubic(wProgress)) * twistAngles[w];

                ctx.save();
                ctx.rotate(twist + w * 0.03);
                const r = flowerRadius * scale * (1 - w * 0.11);
                ctx.globalAlpha = baseAlpha * Math.min(1, wProgress * 1.65);
                ctx.drawImage(sprite, -r, -r, r * 2, r * 2);
                ctx.restore();
            }
        }

        ctx.restore();
    }

    function drawButterfly3D(ctx, b, time, width, height, alpha) {
        const bx = b.x * width;
        const by = b.y * height;
        const flap = Math.sin(time * b.flapSpeed + b.phase);
        const wingSpread = Math.abs(flap) * 0.82 + 0.18;

        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(Math.sin(time * 1.4 + b.phase) * 0.22 + (b.vx >= 0 ? 0.15 : -0.15));
        ctx.scale(b.scale, b.scale);
        ctx.globalAlpha = alpha;

        ctx.shadowColor = rgb(b.color1, 0.5);
        ctx.shadowBlur = 8;

        for (let side of[-1, 1]) {
            ctx.save();
            ctx.scale(side * wingSpread, 1);

            const wg = ctx.createLinearGradient(0, -14, 22, 14);
            wg.addColorStop(0, rgb(b.color1));
            wg.addColorStop(0.65, rgb(b.color2));
            wg.addColorStop(1, '#ffffff');

            ctx.fillStyle = wg;
            ctx.beginPath();
            ctx.moveTo(0, -2);
            ctx.bezierCurveTo(13, -20, 28, -12, 20, 2);
            ctx.bezierCurveTo(14, 7, 5, 4, 0, 2);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(0, 2);
            ctx.bezierCurveTo(16, 4, 20, 16, 9, 18);
            ctx.bezierCurveTo(4, 19, 1, 9, 0, 4);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }

        ctx.fillStyle = '#2d1b2e';
        ctx.beginPath();
        ctx.ellipse(0, 2, 1.6, 7, 0, 0, TAU);
        ctx.fill();

        ctx.restore();
    }

    function drawShootingStars(ctx, shootingStars, dt, width, height) {
        for (let i = 0; i < shootingStars.length; i++) {
            const s = shootingStars[i];
            if (!s.active) {
                s.cooldown -= dt;
                if (s.cooldown <= 0) {
                    s.active = true;
                    s.x = (0.15 + Math.random() * 0.8) * width;
                    s.y = (0.03 + Math.random() * 0.28) * height;
                    const speed = 650 + Math.random() * 450;
                    const angle = Math.PI * (0.68 + Math.random() * 0.12);
                    s.vx = Math.cos(angle) * speed;
                    s.vy = Math.sin(angle) * speed;
                    s.len = 95 + Math.random() * 85;
                    s.life = 0;
                    s.maxLife = 0.65 + Math.random() * 0.55;
                }
                continue;
            }

            s.life += dt;
            s.x += s.vx * dt;
            s.y += s.vy * dt;

            if (s.life >= s.maxLife || s.x < -150 || s.y > height * 0.75) {
                s.active = false;
                s.cooldown = 1.1 + Math.random() * 3.5;
                continue;
            }

            const progress = s.life / s.maxLife;
            const alpha = progress < 0.2 ? progress / 0.2 : (1 - progress) / 0.8;
            const norm = Math.hypot(s.vx, s.vy) || 1;
            const tailX = s.x - (s.vx / norm) * s.len;
            const tailY = s.y - (s.vy / norm) * s.len;

            ctx.save();
            const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
            grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
            grad.addColorStop(0.3, `rgba(56, 189, 248, ${alpha * 0.85})`);
            grad.addColorStop(0.7, `rgba(244, 114, 182, ${alpha * 0.6})`);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.strokeStyle = grad;
            ctx.lineWidth = 2.4;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(tailX, tailY);
            ctx.stroke();

            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(s.x, s.y, 2.5, 0, TAU);
            ctx.fill();
            ctx.restore();
        }
    }

    // NỀN FULL XANH LAM MIX HỒNG CHO CẢ NGÀY VÀ ĐÊM
    function drawBackground(ctx, time, dt, env, isDark, stars, shootingStars, isFxEnabled) {
        const { width, height, mouseX, mouseY } = env;

        const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
        if (isDark) {
            // Ban đêm: Xanh Lam Đậm (Deep Sapphire Blue) chuyển dần sang Hồng Tím Đêm
            skyGrad.addColorStop(0, '#04122c');
            skyGrad.addColorStop(0.38, '#0b2559');
            skyGrad.addColorStop(0.72, '#3b1d5e');
            skyGrad.addColorStop(1, '#701a4c');
        } else {
            // Ban ngày: Xanh Lam Bầu Trời (Azure/Sky Blue) chuyển mượt sang Hồng Đào Phấn (Soft Pink/Blush)
            skyGrad.addColorStop(0, '#38bdf8');
            skyGrad.addColorStop(0.32, '#93c5fd');
            skyGrad.addColorStop(0.68, '#fbcfe8');
            skyGrad.addColorStop(1, '#f9a8d4');
        }
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, height);

        // Ánh sáng hồng-lam lan tỏa góc chéo
        const ambientGlow = ctx.createRadialGradient(
            width * 0.2, height * 0.75, 20,
            width * 0.2, height * 0.75, Math.max(width, height) * 0.65
        );
        if (isDark) {
            ambientGlow.addColorStop(0, 'rgba(244, 114, 182, 0.22)');
            ambientGlow.addColorStop(0.5, 'rgba(56, 189, 248, 0.1)');
            ambientGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
            ambientGlow.addColorStop(0, 'rgba(244, 114, 182, 0.32)');
            ambientGlow.addColorStop(0.5, 'rgba(147, 197, 253, 0.2)');
            ambientGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        }
        ctx.fillStyle = ambientGlow;
        ctx.fillRect(0, 0, width, height);

        if (isDark) {
            const moonX = width * 0.83 + mouseX * 12;
            const moonY = height * 0.13 + mouseY * 8;

            const moonGlow = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 115);
            moonGlow.addColorStop(0, 'rgba(224, 242, 254, 0.45)');
            moonGlow.addColorStop(0.5, 'rgba(244, 114, 182, 0.16)');
            moonGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = moonGlow;
            ctx.beginPath();
            ctx.arc(moonX, moonY, 115, 0, TAU);
            ctx.fill();

            ctx.fillStyle = '#f0f9ff';
            ctx.beginPath();
            ctx.arc(moonX, moonY, 30, 0, TAU);
            ctx.fill();

            for (let i = 0; i < stars.length; i++) {
                const st = stars[i];
                const twinkle = 0.35 + 0.65 * Math.sin(time * st.speed + st.phase);
                ctx.fillStyle = i % 3 === 0 ?
                    `rgba(249, 168, 212, ${twinkle})` :
                    `rgba(224, 242, 254, ${twinkle})`;
                ctx.beginPath();
                ctx.arc(st.x * width, st.y * height * 0.62, st.r, 0, TAU);
                ctx.fill();
            }

            if (isFxEnabled) {
                drawShootingStars(ctx, shootingStars, dt, width, height);
            }
        } else {
            const sunGrad = ctx.createRadialGradient(width * 0.82, height * 0.1, 10, width * 0.82, height * 0.1, Math.max(width, height) * 0.65);
            sunGrad.addColorStop(0, 'rgba(255, 240, 248, 0.78)');
            sunGrad.addColorStop(0.4, 'rgba(251, 207, 232, 0.28)');
            sunGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = sunGrad;
            ctx.fillRect(0, 0, width, height);

            const clouds = [
                { x: 0.75, y: 0.18, size: 0.42, opacity: 0.82, speed: 2.0 },
                { x: 0.24, y: 0.30, size: 0.31, opacity: 0.68, speed: 3.4 },
                { x: 0.52, y: 0.11, size: 0.36, opacity: 0.74, speed: 2.7 },
                { x: 0.12, y: 0.16, size: 0.32, opacity: 0.70, speed: 2.3 }
            ];

            clouds.forEach((c, idx) => {
                const cloudX = ((c.x * width + time * c.speed * 5 + mouseX * 14) % (width * 1.4)) - width * 0.2;
                const cloudY = c.y * height + Math.sin(time * 0.45 + idx) * 5 + mouseY * 6;
                const rx = c.size * Math.min(width, 1200) * 0.55;
                const ry = rx * 0.36;

                ctx.save();
                const grad = ctx.createRadialGradient(cloudX, cloudY, rx * 0.1, cloudX, cloudY, rx);
                grad.addColorStop(0, `rgba(255, 250, 253, ${c.opacity})`);
                grad.addColorStop(0.6, `rgba(252, 231, 243, ${c.opacity * 0.5})`);
                grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = grad;
                ctx.translate(cloudX, cloudY);
                ctx.scale(1, ry / rx);
                ctx.beginPath();
                ctx.arc(0, 0, rx, 0, TAU);
                ctx.fill();
                ctx.restore();
            });
        }
    }

    return {
        TAU,
        palettes,
        sprites,
        rgb,
        drawFlower,
        drawButterfly3D,
        drawBackground
    };
})();