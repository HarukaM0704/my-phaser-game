import Phaser from "phaser";

class ScrollScene extends Phaser.Scene {
    //初期化
    private _cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;
    private _player?: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private _stars?: Phaser.Physics.Arcade.Group;
    private _bombs?: Phaser.Physics.Arcade.Group;
    private _score: number = 0;
    private _scoreText?: Phaser.GameObjects.Text;

    constructor() {
        super({key: 'scrollScene'});
    }

    //ゲーム素材を読み込む（最初に読み込んでおく必要がある
    preload() :void {
        //素材リソースのベースとなるURLを指定
        this.load.setBaseURL("https://labs.phaser.io");
    

        /**
         * 第一引数には読み込んだ素材を識別するためのキーを指定
        * 第二引数に対象の画像を指定
        * ベースURLに第二引数がくっつく
        */
        this.load.image('sky', 'assets/skies/space3.png');
        this.load.image('ground', 'assets/sprites/platform.png');
        this.load.image('star', 'assets/demoscene/star.png');
        this.load.image('bomb', 'assets/sprites/bullet.png');
        //マップデータ（スプライトシート）を読み込む
        this.load.spritesheet('dude',   //キー名
            'assets/sprites/dude.png',  //画像を指定
            {frameWidth: 32, frameHeight: 48}   //フレームの幅と高さを指定
        );
    }

    //ゲーム画面の初期化
    create() : void {
        //背景画像の追加
        //画像の表示位置はx:400, y300
        //preloadで読み込んだsky画像を指定
        //オブジェクトが表示される順序は、下記で作成している順序と一致する
        //背景画像にしたい画像は一番最初に指定する
        this.add.image(400,300,'sky');

        //静的な物理オブジェクトを作成するための設定
        //オブジェクトは動かない壁や地面に使う
        const platforms = this.physics.add.staticGroup();

        //画面内の緑の地面を作成
        //setScale(2)で画像のサイズを2倍に拡大、スケール変更時は物理エンジンを更新
        platforms.create(400,568,'ground').setScale(2).refreshBody();
        platforms.create(600,400,'ground');
        platforms.create(50,250,'ground');
        platforms.create(750,250,'ground');

        //プレイヤーを作成、初期配置
        this._player = this.physics.add.sprite(100,450,'dude');
        this._player.setBounce(0,2);    //地面に着地した際のバウンド値
        this._player.setCollideWorldBounds(true);   //画面の外に出ないようにする

        //プレイヤーにアニメーションを定義(あくまでアニメーションの定義であってこれで動くわけではない)
        this.anims.create({
            key: 'left',    //左向きのアニメーション
            frames: this.anims.generateFrameNumbers('dude',{start: 0, end: 3}), //0~3をフレームで指定
            frameRate: 10,
            repeat: -1  //繰り返し再生
        });
        this.anims.create({
            key: 'turn',
            frames: [{key: 'dude', frame: 4}],
            frameRate: 20
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', {start: 5, end: 8}),
            frameRate: 10,
            repeat: -1
        });

        //地面オブジェクト、プレイヤーオブジェクトの衝突判定を行うcolliderオブジェクトを作成
        this.physics.add.collider(this._player, platforms);

        //プレイヤーを操作するためのキーボードマネージャ反映
        if (this.input.keyboard) {
            this._cursorKeys = this.input.keyboard.createCursorKeys();
        } else {
            console.error('keyboard input not initialized');
        }

        //マップに配置する動的な星オブジェクトを作成
        this._stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: {x: 12, y: 0, stepX: 70}
        });

        this._stars.children.iterate((child: Phaser.GameObjects.GameObject) => {
            //作成された12個の星オブジェクトに0.4~0.8のバウンド値を設定
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });
    }
}