import Phaser from 'phaser';
import { createGameTextures } from './assets';
import { banjoAudio } from './audio';
import confetti from 'canvas-confetti';

interface RhythmBeatItem {
    sprite: Phaser.GameObjects.Sprite;
    targetTime: number;
    hit: boolean;
    key: 'A' | 'S' | 'D' | 'F' | 'SPACE';
    targetX: number;
}

export class GameScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private platforms!: Phaser.Physics.Arcade.StaticGroup;
    private notesGroup!: Phaser.Physics.Arcade.Group;
    private enemiesGroup!: Phaser.Physics.Arcade.Group;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private keyZ!: Phaser.Input.Keyboard.Key;
    private spaceKey!: Phaser.Input.Keyboard.Key;

    // Score & Rhythm State
    private score: number = 0;
    private combo: number = 0;
    private health: number = 3;
    private scoreText!: Phaser.GameObjects.Text;
    private comboText!: Phaser.GameObjects.Text;
    private healthText!: Phaser.GameObjects.Text;
    private rhythmFeedbackText!: Phaser.GameObjects.Text;

    // Rhythm Lane
    private activeBeats: RhythmBeatItem[] = [];
    private rhythmBarBg!: Phaser.GameObjects.Rectangle;
    private rhythmHitZone!: Phaser.GameObjects.Rectangle;
    private nextBeatSpawnTime: number = 0;
    private beatIntervalMs: number = (60 / 110) * 1000;

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Procedurally generated high quality textures
        createGameTextures(this);
    }

    create() {
        const { width, height } = this.scale;

        // Background gradient simulation
        const bg = this.add.graphics();
        bg.fillGradientStyle(0x1e1b4b, 0x1e1b4b, 0x312e81, 0x4338ca, 1);
        bg.fillRect(0, 0, width, height);

        // Twinkling stars / musical particle background
        for (let i = 0; i < 40; i++) {
            const star = this.add.circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height - 120),
                Phaser.Math.Between(1, 2.5),
                0xfffbeb,
                Phaser.Math.FloatBetween(0.3, 0.9)
            );
            this.tweens.add({
                targets: star,
                alpha: 0.2,
                duration: Phaser.Math.Between(800, 2000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // Static Platforms
        this.platforms = this.physics.add.staticGroup();

        // Main floor
        for (let x = 0; x < width + 64; x += 64) {
            this.platforms.create(x, height - 100, 'platform_tile').setScale(1).refreshBody();
        }

        // Floating musical platforms
        const platformCoords = [
            { x: 180, y: height - 180 },
            { x: 244, y: height - 180 },
            { x: 380, y: height - 260 },
            { x: 444, y: height - 260 },
            { x: 600, y: height - 210 },
            { x: 664, y: height - 210 },
            { x: 780, y: height - 310 },
            { x: 844, y: height - 310 },
            { x: 280, y: height - 380 },
            { x: 344, y: height - 380 },
            { x: 500, y: height - 420 },
            { x: 564, y: height - 420 },
        ];

        platformCoords.forEach(pos => {
            this.platforms.create(pos.x, pos.y, 'platform_tile').refreshBody();
        });

        // Player setup
        this.player = this.physics.add.sprite(80, height - 180, 'banjoui_hero');
        this.player.setBounce(0.08);
        this.player.setCollideWorldBounds(true);
        (this.player.body as Phaser.Physics.Arcade.Body).setSize(30, 36);
        (this.player.body as Phaser.Physics.Arcade.Body).setOffset(7, 4);

        // Collision with platforms
        this.physics.add.collider(this.player, this.platforms);

        // Golden Musical Notes
        this.notesGroup = this.physics.add.group();
        const noteSpawns = [
            { x: 212, y: height - 220 },
            { x: 412, y: height - 300 },
            { x: 632, y: height - 250 },
            { x: 812, y: height - 350 },
            { x: 312, y: height - 420 },
            { x: 532, y: height - 460 },
            { x: 120, y: height - 140 },
            { x: 480, y: height - 140 },
            { x: 740, y: height - 140 },
        ];

        noteSpawns.forEach((pos, idx) => {
            const note = this.notesGroup.create(pos.x, pos.y, 'music_note') as Phaser.Physics.Arcade.Sprite;
            note.setData('noteIndex', idx);
            // Floating bounce animation
            this.tweens.add({
                targets: note,
                y: pos.y - 8,
                duration: 900 + idx * 100,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        });

        this.physics.add.collider(this.notesGroup, this.platforms);
        this.physics.add.overlap(this.player, this.notesGroup, this.collectNote as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);

        // Discord Enemies (patrolling)
        this.enemiesGroup = this.physics.add.group();
        const enemy1 = this.enemiesGroup.create(400, height - 140, 'enemy_discord') as Phaser.Physics.Arcade.Sprite;
        const enemy2 = this.enemiesGroup.create(650, height - 250, 'enemy_discord') as Phaser.Physics.Arcade.Sprite;
        
        [enemy1, enemy2].forEach(enemy => {
            enemy.setVelocityX(60);
            enemy.setBounce(1);
            enemy.setCollideWorldBounds(true);
        });

        this.physics.add.collider(this.enemiesGroup, this.platforms);
        this.physics.add.collider(this.player, this.enemiesGroup, this.hitEnemy as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);

        // Rhythm UI Bar at the bottom
        this.createRhythmBar(width, height);

        // HUD Text
        this.scoreText = this.add.text(20, 20, 'SCORE: 0', {
            fontSize: '20px',
            fontFamily: 'system-ui, sans-serif',
            color: '#fbbf24',
            fontStyle: 'bold'
        }).setShadow(2, 2, '#000', 3);

        this.comboText = this.add.text(20, 48, 'COMBO: 0x', {
            fontSize: '16px',
            fontFamily: 'system-ui, sans-serif',
            color: '#38bdf8',
            fontStyle: 'bold'
        }).setShadow(1, 1, '#000', 2);

        this.healthText = this.add.text(width - 150, 20, 'BANJO HP: ❤️❤️❤️', {
            fontSize: '18px',
            fontFamily: 'system-ui, sans-serif',
            color: '#f43f5e',
            fontStyle: 'bold'
        }).setShadow(2, 2, '#000', 3);

        this.rhythmFeedbackText = this.add.text(width / 2, height - 100, '', {
            fontSize: '26px',
            fontFamily: 'system-ui, sans-serif',
            color: '#34d399',
            fontStyle: '900'
        }).setOrigin(0.5);

        // Keyboard Controls
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keyZ = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

        // Sound on click / enable audio ctx
        this.input.on('pointerdown', () => {
            banjoAudio.playBanjoNote(392);
        });

        // Instructions banner
        this.add.text(width / 2, 24, '🎵 ARROWS: Move & Jump | SPACE / Z: Banjo Strum Rhythm Beat!', {
            fontSize: '14px',
            fontFamily: 'system-ui, sans-serif',
            color: '#e2e8f0',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5);
    }

    private createRhythmBar(width: number, height: number) {
        const barY = height - 42;
        // Outer rhythm container
        this.rhythmBarBg = this.add.rectangle(width / 2, barY, width - 40, 52, 0x0f172a, 0.85);
        this.rhythmBarBg.setStrokeStyle(2, 0x6366f1);

        // Hit zone on the left
        const hitZoneX = 140;
        this.rhythmHitZone = this.add.rectangle(hitZoneX, barY, 44, 44, 0x38bdf8, 0.3);
        this.rhythmHitZone.setStrokeStyle(3, 0x38bdf8);

        this.add.text(hitZoneX, barY, 'HIT [SPACE]', {
            fontSize: '11px',
            fontFamily: 'system-ui, sans-serif',
            color: '#e0f2fe',
            fontStyle: 'bold'
        }).setOrigin(0.5);
    }

    private collectNote(_player: Phaser.GameObjects.GameObject, noteObj: Phaser.GameObjects.GameObject) {
        const note = noteObj as Phaser.Physics.Arcade.Sprite;
        const noteIdx = (note.getData('noteIndex') as number) || 0;
        
        banjoAudio.playNoteCollect(noteIdx);

        // Flash & floating points animation
        this.showFloatText(note.x, note.y, '+100 🎵', '#fbbf24');
        this.score += 100;
        this.scoreText.setText(`SCORE: ${this.score}`);

        note.destroy();

        // Check if all notes collected
        if (this.notesGroup.countActive() === 0) {
            this.triggerVictory();
        }
    }

    private hitEnemy(_player: Phaser.GameObjects.GameObject, enemyObj: Phaser.GameObjects.GameObject) {
        const enemy = enemyObj as Phaser.Physics.Arcade.Sprite;
        const playerBody = this.player.body as Phaser.Physics.Arcade.Body;

        // If player jumped on top of enemy
        if (playerBody.velocity.y > 0 && this.player.y < enemy.y - 10) {
            playerBody.setVelocityY(-260);
            banjoAudio.playStrumBurst();
            this.showFloatText(enemy.x, enemy.y, 'PURIFIED! +250', '#a855f7');
            this.score += 250;
            this.scoreText.setText(`SCORE: ${this.score}`);
            enemy.destroy();
        } else {
            // Player got hurt
            banjoAudio.playBanjoNote(140);
            this.health = Math.max(0, this.health - 1);
            this.healthText.setText(`BANJO HP: ${'❤️'.repeat(this.health)}${'🖤'.repeat(3 - this.health)}`);
            this.player.setTint(0xff5555);
            this.time.delayedCall(300, () => this.player.clearTint());

            // Knockback
            playerBody.setVelocityY(-180);
            playerBody.setVelocityX(this.player.x < enemy.x ? -150 : 150);

            if (this.health <= 0) {
                this.triggerGameOver();
            }
        }
    }

    private triggerVictory() {
        banjoAudio.playStrumBurst();
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
        const { width, height } = this.scale;
        this.add.text(width / 2, height / 2 - 30, '🎶 MELODY COMPLETE! 🎶', {
            fontSize: '36px',
            fontFamily: 'system-ui, sans-serif',
            color: '#fbbf24',
            fontStyle: 'bold',
            backgroundColor: 'rgba(0,0,0,0.85)',
            padding: { x: 20, y: 15 }
        }).setOrigin(0.5);
    }

    private triggerGameOver() {
        const { width, height } = this.scale;
        this.physics.pause();
        this.add.text(width / 2, height / 2, 'OUT OF STRINGS!\nClick to Re-tune', {
            fontSize: '32px',
            fontFamily: 'system-ui, sans-serif',
            color: '#ef4444',
            fontStyle: 'bold',
            align: 'center',
            backgroundColor: 'rgba(0,0,0,0.85)',
            padding: { x: 20, y: 15 }
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.restart();
            this.health = 3;
            this.score = 0;
            this.combo = 0;
        });
    }

    private showFloatText(x: number, y: number, text: string, color: string) {
        const t = this.add.text(x, y, text, {
            fontSize: '16px',
            fontFamily: 'system-ui, sans-serif',
            color: color,
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: t,
            y: y - 35,
            alpha: 0,
            duration: 800,
            onComplete: () => t.destroy()
        });
    }

    private checkRhythmInput() {
        const hitZoneX = 140;
        const tolerance = 40; // Pixel accuracy tolerance

        let closestIdx = -1;
        let minDiff = 99999;

        this.activeBeats.forEach((item, idx) => {
            if (!item.hit) {
                const diff = Math.abs(item.sprite.x - hitZoneX);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestIdx = idx;
                }
            }
        });

        if (closestIdx !== -1 && minDiff <= tolerance) {
            const beat = this.activeBeats[closestIdx];
            beat.hit = true;
            beat.sprite.destroy();

            const isPerfect = minDiff < 16;
            const pts = isPerfect ? 150 : 75;
            this.combo++;
            this.score += pts * Math.min(this.combo, 4);

            banjoAudio.playRhythmHit(isPerfect);
            banjoAudio.playBanjoNote(Phaser.Math.RND.pick([330, 392, 494, 587, 659]));

            // Visual strum blast from Banjoui hero
            this.spawnStrumWave();

            // Hit feedback text
            this.rhythmFeedbackText.setText(isPerfect ? 'PERFECT! 🌟' : 'GOOD! 🎵');
            this.rhythmFeedbackText.setColor(isPerfect ? '#34d399' : '#38bdf8');
            this.tweens.add({
                targets: this.rhythmFeedbackText,
                scale: { from: 1.4, to: 1 },
                duration: 200
            });

            // Hit zone pulse
            this.tweens.add({
                targets: this.rhythmHitZone,
                scale: 1.3,
                duration: 100,
                yoyo: true
            });
        } else {
            // Missed beat
            this.combo = 0;
            this.rhythmFeedbackText.setText('MISS');
            this.rhythmFeedbackText.setColor('#94a3b8');
        }

        this.scoreText.setText(`SCORE: ${this.score}`);
        this.comboText.setText(`COMBO: ${this.combo}x`);
    }

    private spawnStrumWave() {
        const wave = this.physics.add.sprite(this.player.x + (this.player.flipX ? -20 : 20), this.player.y, 'sound_wave');
        wave.setFlipX(this.player.flipX);
        const waveBody = wave.body as Phaser.Physics.Arcade.Body;
        waveBody.setAllowGravity(false);
        waveBody.setVelocityX(this.player.flipX ? -350 : 350);

        // Check if wave hits enemies
        this.physics.add.overlap(wave, this.enemiesGroup, (_w, enemyObj) => {
            const enemy = enemyObj as Phaser.Physics.Arcade.Sprite;
            banjoAudio.playBanjoNote(659);
            this.showFloatText(enemy.x, enemy.y, 'RHYTHM BLAST! +300', '#38bdf8');
            this.score += 300;
            this.scoreText.setText(`SCORE: ${this.score}`);
            enemy.destroy();
            wave.destroy();
        });

        this.time.delayedCall(700, () => {
            if (wave.active) wave.destroy();
        });
    }

    update(time: number) {
        const playerBody = this.player.body as Phaser.Physics.Arcade.Body;

        // Player Movement
        if (this.cursors.left.isDown) {
            playerBody.setVelocityX(-210);
            this.player.setFlipX(true);
        } else if (this.cursors.right.isDown) {
            playerBody.setVelocityX(210);
            this.player.setFlipX(false);
        } else {
            playerBody.setVelocityX(0);
        }

        // Jump
        if ((this.cursors.up.isDown || this.cursors.space.isDown) && playerBody.blocked.down) {
            playerBody.setVelocityY(-440);
            banjoAudio.playJump();
        }

        // Rhythm action (Z key or Space key check)
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.keyZ)) {
            this.checkRhythmInput();
        }

        // Spawn Rhythm notes traveling right to left along the rhythm track
        if (time > this.nextBeatSpawnTime) {
            this.spawnRhythmBeat(time);
            this.nextBeatSpawnTime = time + this.beatIntervalMs;
        }

        // Move rhythm beats
        const speed = 260; // pixels per sec
        for (let i = this.activeBeats.length - 1; i >= 0; i--) {
            const beat = this.activeBeats[i];
            beat.sprite.x -= speed * (this.game.loop.delta / 1000);

            // Passed the hit zone and missed
            if (beat.sprite.x < 80 && !beat.hit) {
                beat.hit = true;
                beat.sprite.destroy();
                this.activeBeats.splice(i, 1);
                if (this.combo > 0) {
                    this.combo = 0;
                    this.comboText.setText(`COMBO: 0x`);
                }
            } else if (beat.sprite.x < 50) {
                beat.sprite.destroy();
                this.activeBeats.splice(i, 1);
            }
        }

        // Patrolling enemy bounce bounds
        this.enemiesGroup.getChildren().forEach((c) => {
            const enemy = c as Phaser.Physics.Arcade.Sprite;
            if (enemy && enemy.body) {
                if (enemy.body.blocked.left) {
                    enemy.setVelocityX(70);
                } else if (enemy.body.blocked.right) {
                    enemy.setVelocityX(-70);
                }
            }
        });
    }

    private spawnRhythmBeat(_currTime: number) {
        const { width, height } = this.scale;
        const barY = height - 42;
        const beatSprite = this.add.sprite(width - 40, barY, 'rhythm_beat');
        beatSprite.setDepth(10);

        this.activeBeats.push({
            sprite: beatSprite,
            targetTime: 0,
            hit: false,
            key: 'SPACE',
            targetX: 140
        });
    }
}
