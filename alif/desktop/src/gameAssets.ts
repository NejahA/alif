import Phaser from 'phaser';

export function createGameTextures(scene: Phaser.Scene) {
    // 1. Banjoui Hero texture (a friendly character with a banjo)
    const heroG = scene.make.graphics({ x: 0, y: 0 });
    
    // Character body (fluffy bear/fox style)
    heroG.fillStyle(0xd97736, 1); // warm brown/orange
    heroG.fillCircle(20, 20, 16);

    // Ears
    heroG.fillStyle(0xa0522d, 1);
    heroG.fillTriangle(6, 10, 12, 0, 18, 8);
    heroG.fillTriangle(22, 8, 28, 0, 34, 10);

    // Face features
    heroG.fillStyle(0xffffff, 1);
    heroG.fillCircle(14, 16, 4);
    heroG.fillCircle(26, 16, 4);
    heroG.fillStyle(0x1a1a1a, 1);
    heroG.fillCircle(15, 16, 2);
    heroG.fillCircle(27, 16, 2);
    heroG.fillCircle(20, 22, 2.5); // nose

    // Banjo slung across back
    heroG.fillStyle(0xfde047, 1); // golden rim
    heroG.fillCircle(30, 26, 8);
    heroG.fillStyle(0xffedd5, 1); // banjo head
    heroG.fillCircle(30, 26, 6);
    // Banjo neck
    heroG.lineStyle(3, 0x854d0e, 1);
    heroG.lineBetween(30, 26, 38, 10);

    heroG.generateTexture('banjoui_hero', 44, 40);
    heroG.destroy();

    // 2. Musical Note Collectible (Golden eighth note)
    const noteG = scene.make.graphics({ x: 0, y: 0 });
    noteG.fillStyle(0xf59e0b, 1);
    // Note head
    noteG.fillEllipse(8, 18, 6, 5);
    // Note stem
    noteG.fillRect(12, 4, 3, 14);
    // Note flag
    noteG.fillRect(15, 4, 6, 3);
    noteG.fillRect(19, 7, 3, 3);
    // Outer glow highlight
    noteG.lineStyle(1.5, 0xfef08a, 0.9);
    noteG.strokeEllipse(8, 18, 6, 5);
    noteG.generateTexture('music_note', 26, 26);
    noteG.destroy();

    // 3. Platform Tile
    const platformG = scene.make.graphics({ x: 0, y: 0 });
    // Wood / Meadow platform
    platformG.fillStyle(0x4d7c0f, 1); // grass top
    platformG.fillRect(0, 0, 64, 8);
    platformG.fillStyle(0x78350f, 1); // wood base
    platformG.fillRect(0, 8, 64, 24);
    // wood plank line details
    platformG.lineStyle(1.5, 0x92400e, 1);
    platformG.lineBetween(0, 16, 64, 16);
    platformG.lineBetween(20, 8, 20, 16);
    platformG.lineBetween(44, 16, 44, 24);
    platformG.generateTexture('platform_tile', 64, 32);
    platformG.destroy();

    // 4. Rhythm Target Note (circle with banjo string vibe)
    const rTargetG = scene.make.graphics({ x: 0, y: 0 });
    rTargetG.fillStyle(0x06b6d4, 0.9);
    rTargetG.fillCircle(16, 16, 15);
    rTargetG.lineStyle(2, 0xffffff, 1);
    rTargetG.strokeCircle(16, 16, 15);
    rTargetG.fillStyle(0xffffff, 1);
    rTargetG.fillCircle(16, 16, 5);
    rTargetG.generateTexture('rhythm_beat', 32, 32);
    rTargetG.destroy();

    // 5. Soundwave attack particle
    const waveG = scene.make.graphics({ x: 0, y: 0 });
    waveG.lineStyle(3, 0x38bdf8, 1);
    waveG.arc(16, 16, 12, Phaser.Math.DegToRad(-45), Phaser.Math.DegToRad(45));
    waveG.strokePath();
    waveG.generateTexture('sound_wave', 32, 32);
    waveG.destroy();

    // 6. Rhythm Enemy (Discordant Sprite)
    const enemyG = scene.make.graphics({ x: 0, y: 0 });
    enemyG.fillStyle(0x9333ea, 1); // purple discord creature
    enemyG.fillCircle(16, 16, 14);
    // Spikes/glitch
    enemyG.fillStyle(0xc084fc, 1);
    enemyG.fillTriangle(10, 4, 16, 0, 22, 4);
    enemyG.fillTriangle(26, 10, 32, 16, 26, 22);
    enemyG.fillTriangle(4, 10, 0, 16, 4, 22);
    // angry eyes
    enemyG.fillStyle(0xffffff, 1);
    enemyG.fillRect(10, 12, 4, 3);
    enemyG.fillRect(18, 12, 4, 3);
    enemyG.fillStyle(0xef4444, 1);
    enemyG.fillRect(12, 13, 2, 2);
    enemyG.fillRect(18, 13, 2, 2);
    enemyG.generateTexture('enemy_discord', 32, 32);
    enemyG.destroy();
}

