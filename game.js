import kaboom from "https://unpkg.com/kaboom@2000.1/dist/kaboom.mjs"
kaboom({
	font: "sinko",
})

// load assets

let bgImage = await loadSprite("background", "/assets/bg/back.png")
loadSprite("box", "/assets/sprites/big-crate.png")
loadSprite("house", "/assets/sprites/house.png")
loadSprite("block-big", "/assets/sprites/block-big.png")
loadSprite("platform", "/assets/sprites/platform-long.png")
loadSprite("gem", "/assets/sprites/gem-1.png")
loadSprite("npc-1", "/assets/player/player-idle-1.png")
loadSprite("tree", "/assets/sprites/tree.png")
loadSprite("vik", "/assets/player/vik.jpg")
loadSprite("bush", "/assets/sprites/bush.png")
loadSprite("rock", "/assets/sprites/rock.png")
loadSprite("player-new", "/assets/player/warrior-spritesheet.png", {
  sliceX: 12,
  sliceY: 1,
  anims: {
    idle: {
      from: 0,
      to: 5,
			loop: true,
    },
    run: {
      from: 6,
      to: 11,
			loop: true,
    },
  }
})
loadSpriteAtlas("/assets/sprites/tileset.png", {
  "t-grass-l": {
    x: 16,
    y: 16,
    width: 16,
    height: 16,
  },
  "t-grass-m": {
    x: 48,
    y: 16,
    width: 16,
    height: 16,
  },
  "t-grass-r": {
    x: 80,
    y: 16,
    width: 16,
    height: 16,
  },
  "t-dirt-l": {
    x: 16,
    y: 48,
    width: 16,
    height: 17,
  },
  "t-dirt-m": {
    x: 48,
    y: 48,
    width: 16,
    height: 17,
  },
  "t-dirt-r": {
    x: 80,
    y: 48,
    width: 16,
    height: 17,
  },
  "grass-1": {
    x: 16,
    y: 112,
    width: 16,
    height: 16,
  },
})

// define some constants
const JUMP_FORCE = 1800
const MOVE_SPEED = 360
const FALL_DEATH = 2400

const LEVELS = [
  // [
  //   "                                    ",
  //   "    *                               ",
  //   "   --                        *  H   ",
  //   "[===============================]",
  //   "[###############################]",
  // ],
  [
    "                                                                         ",
    "                                                    p* bb                ",
    "                                                  [=======]              ",
    "                                                                         ",
    "                                                            *            ",
    "                                               --           --           ",
    "                                                                         ",
    "                                                  *                      ",
    "                                                  --     --              ",
    "                                                                         ",
    "                                                                         ",
    "               *                                     oo*                 ",
    "              ---                        *          [==] ~~r~            ",
    "                                  bbb   --   |rr[===####=====]  | *  H | ",
    "         o                     r[=====]    [====##############==========]",
    "    p*   oo           *| |  [===######\\    /############################\\",
    "[==========]   *   [========##########\\    /#############################",
    "/##########\\~~~~~~~/#################\\     /#############################",
    "/###########=======####################    #############################",
    "#######################################    ##############################",
    "#######################################    ##############################",
  ],
]

const levelConf = {
  width: 128,
  height: 128,
  "[": () => [
    sprite("t-grass-l"),
    scale(8),
    area(),
    solid(),
    origin("bot"),
  ],
  "]": () => [
    sprite("t-grass-r"),
    scale(8),
    area(),
    solid(),
    origin("bot"),
  ],
  "=": () => [
    sprite("t-grass-m"),
    scale(8),
    area(),
    solid(),
    origin("bot"),
  ],
  "/": () => [
    sprite("t-dirt-l"),
    scale(8),
    area(),
    solid(),
    origin("bot"),
  ],
  "#": () => [
    sprite("t-dirt-m"),
    scale(8),
    area(),
    origin("bot")
  ],
  "\\": () => [
    sprite("t-dirt-r"),
    scale(8),
    area(),
    origin("bot")
  ],
  "~": () => [
    sprite("grass-1"),
    scale(8),
    area(),
    origin("bot")
  ],
  "b": () => [
    sprite("bush"),
    scale(8),
    area(),
    origin("bot")
  ],
  "-": () => [
    sprite("platform"),
    scale(4),
    area(),
    solid(),
  ],
  "|": () => [
    sprite("tree"),
    scale(8),
    area(),
    origin("bot")
  ],
  "r": () => [
    sprite("rock"),
    scale(4),
    area(),
    origin("bot")
  ],
  "o": () => [
    sprite("box"),
    area(),
    scale(4),
    origin("bot")
  ],
  "H": () => [
    sprite("house"),
    area(),
    scale(6),
    origin("bot")
  ],
  // collectibles
  "*": () => [
    sprite("gem"),
    area(),
    scale(8),
    origin("bot"),
    "diamond"
  ],
  // NPCs
  "p": () => [
    sprite("npc-1"),
    area(),
    scale(6),
    origin("bot")
  ]
}

scene("game", ({ levelId, coins } = { levelId: 0, coins: 0 }) => {

	gravity(3200)

  const background = add([
    sprite("background"),
    // Make the background centered on the screen
    pos(width() / 2, height() / 2),
    origin("center"),
    // Allow the background to be scaled
    scale(1),
    // Keep the background position fixed even when the camera moves
    fixed(),
    z(-1)
  ])
  
  // Scale the background to cover the screen
  background.scaleTo(Math.max(
    width() / bgImage.tex.width,
    height() / bgImage.tex.height
  ));

	// add level to scene
	const level = addLevel(LEVELS[levelId ?? 0], levelConf)

  const label = add([
    text("Yeah"),
    pos(20),
    scale(6),
		fixed(),
  ])

  // define player object
	const player = add([
		sprite("player-new"),
		pos(0, 0),
		scale(6),
    area({scale: {x: 0.6, y: 1}}),
    origin("center"),
		// makes it fall to gravity and jumpable
		body(),
	])

  player.play("idle")

  player.onGround(() => {
    if (!isKeyDown("left") && !isKeyDown("right")) {
      player.play("idle")
    } else {
      player.play("run")
    }
  })

  player.onUpdate(() => {
		// center camera to player
		camPos(player.pos)
	})
  
  onKeyPress("space", () => {
    // these 2 functions are provided by body() component
    if (player.isGrounded()) {
      player.jump(JUMP_FORCE)
    }
  })

  onKeyDown("left", () => {
		player.move(-MOVE_SPEED, 0)
    player.flipX(true)
    if (player.isGrounded() && player.curAnim() !== "run") {
      player.play("run")
    }
	})

	onKeyDown("right", () => {
		player.move(MOVE_SPEED, 0)
    player.flipX(false)
    if (player.isGrounded() && player.curAnim() !== "run") {
      player.play("run")
    }
	})

  onKeyRelease(["left", "right"], () => {
    // Only reset to "idle" if player is not holding any of these keys
    if (player.isGrounded() && !isKeyDown("left") && !isKeyDown("right")) {
      player.play("idle")
    }
  })

  player.onCollide("diamond", (d) => {
    destroy(d)
    label.text = "yeah"
  })
})

function addButton(txt, p, f) {

	const btn = add([
		text(txt),
		pos(p),
		area({ cursor: "pointer", }),
		scale(6),
		origin("center"),
	])

	btn.onClick(f)
}

scene("new", () => {
	addButton("I want to explore", center(), () => go("game"))
})

scene("bonus", () => {

})

// scene("win", () => {
// 	add([
// 		text("You Win"),
// 	])
// 	onKeyPress(() => go("game"))
// })

go("new")
