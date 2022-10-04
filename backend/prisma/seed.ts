import { PrismaClient} from "@prisma/client";
const prisma = new PrismaClient()


async function main() {
	
	const sergent = await prisma.user.upsert({
		where: {login: 'mlormois'}, 
		update: {},
		create: {
			login: 'mlormois',
			username: 'lmasturbator',
		},
	}) 

	const Axel = await prisma.user.upsert({
		where: {login: 'axaidan'}, 
		update: {},
		create: {
			login: 'axaidan',
			username: 'skusku',
		},
	}) 

	const Catino = await prisma.user.upsert({
		where: {login: 'fcatinau'},
		update: {},
		create: {
			login: 'fcatinau',
			username: 'ouinouin',
		},
	})

	const viporten = await prisma.user.upsert({
		where: {login: 'viporten'},
		update:{},
		create:{
			login: 'viporten',
			username: 'el beaugausse',
		},
	})

	const achiv = await prisma.achievement.upsert({
		where: {title: '10 in a raw'},
		update: {}, 
		create: {
			title: '10 in a raw',
			descriptions: 'you play 10 game in a raw',
		},
	})

	const achiv1 = await prisma.achievement.upsert({
		where: {title: 'login'},
		update: {}, 
		create: {
			title: 'login',
			descriptions: 'you log for the first time',
		},
	})

	const achiv2 = await prisma.achievement.upsert({
		where: {title: 'first win'},
		update: {}, 
		create: {
			title: 'first win',
			descriptions: 'gg well played',
		},
	})

	const achiv3 = await prisma.achievement.upsert({
		where: {title: 'un curly'},
		update: {}, 
		create: {
			title: 'tiens un curly',
			descriptions: 'tu as ajouter ton premier ami',
		},
	})

	const game1 = await prisma.game.upsert({
		where: {id:1},
		update: {},
		create: {
				player1Id: 1,
				score1: 2,
				player2Id: 2,
				score2: 3,
		},
	})

}

main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async (e) => {
		console.error(e)
		await prisma.$disconnect()
		process.exit()
	})