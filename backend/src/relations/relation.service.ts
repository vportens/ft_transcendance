import { ForbiddenException, Injectable } from "@nestjs/common";
import { prisma, Relation, User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";
import { AchievementService } from "src/achiv/achiv.service";
import { identity } from "rxjs";
import { ConstraintMetadata } from "class-validator/types/metadata/ConstraintMetadata";

@Injectable()
export class RelationService{
	constructor(
		private prisma: PrismaService,
		private achivService: AchievementService) {}


		/* list_block */ 
	async list_block(userId: number) : Promise<User[]> {
	let uid = userId		

	var userArr : User[] = [];
	const blockPeople = await this.prisma.relation.findMany({
		where: {
			userId: uid,
			isBlock: 1,
		},
		select: {
			userIWatch: true,
		}
	})
	for (let people in blockPeople) {
		userArr.push(blockPeople[people].userIWatch);
	}
	return userArr;
	}

		/* list_friend*/ 
	async list_friend(userId: number) : Promise<User[]> {
		let uid = userId;

	var userArr : User[] = [];
		const friends = await this.prisma.relation.findMany({
			where: {
				userId: uid,
				relation: 1,
				isBlock: 0,
			},
			select: {
				userIWatch: true,
			},
		});
		for (let friend in friends) {
			userArr.push(friends[friend].userIWatch);
		}
		console.log(userArr);
		return userArr;
	}		

		/* block_user*/ 
	async block_user(meId: number, userId: string) {
		
		var blockId = parseInt(userId, 10);
		
		var findMe = this.prisma.user.findFirst({where: {id: meId}});
		var findTarget= this.prisma.user.findFirst({where: {id: blockId}});

		if (!findMe) {
			throw new ForbiddenException('u do not exist')
		}
		if (!findTarget) {
			throw new ForbiddenException('your target do not exist')
		}
		const relation = await this.prisma.relation.findFirst({
			where: {
				userId: meId, 
				userIWatchId: blockId,
			},
		})
		if (relation) {
			console.log("relation existante");
			if (relation.isBlock === 1) {
				console.log("user already block")
				return 0;
			}
			else {
				let updateRelation = await this.prisma.relation.update({
					where : {id: relation.id},
					data: {
						isBlock: 1,
					}
				});
				return updateRelation;
			}
		}
		else {
			try {
				var createBlockRelation = await this.prisma.relation.create({
					data: {
						userId: meId,
						userIWatchId: blockId,
						relation : 0,
						isBlock: 1,
					}
				});
			}
			catch (e) {
				throw new ForbiddenException('error');
			}
			return createBlockRelation;
		}
	}

		/* unblock_user*/ 
	async unblock_user(meId: number, userId: string) {
		var targetId = parseInt(userId, 10);

		var findMe = this.prisma.user.findFirst({where: {id: meId}});
		var findTarget= this.prisma.user.findFirst({where: {id: targetId}});

		if (!findMe) {
			throw new ForbiddenException("me not exist");
		}

		if (!findTarget) {
			throw new ForbiddenException("user you looking for doesn't exist");
		}

		const relation = await this.prisma.relation.findFirst({where: {userId: meId, userIWatchId: targetId}});
		if (relation) {
			if (relation.isBlock === 1)	{
				if (relation.relation === 1) {
					let updateRelation = await this.prisma.relation.update({where: {id: relation.id}, data : {isBlock: 0}})
					return ;
				}
				const deleteRelation = await this.prisma.relation.delete({where: {id: relation.id}});
				return ;
			}
			else 
				return ;
		}
		else {
			return ;
		}
		
	}

		/* add_friend*/ 
	async add_friend(meId: number, userId: string) {
		var friendId = parseInt(userId, 10);

			let findMe = await this.prisma.user.findFirst({where: {id: meId}});

		var findNewFriend = await this.prisma.user.findFirst({where: {id: friendId}});

		if (!findMe)
			throw new ForbiddenException("u do not exist")
		if (!findNewFriend) {
			throw new ForbiddenException("friend do not exist")
		}
		let relation = await this.prisma.relation.findFirst({where: {me: findMe, userIWatch: findNewFriend}});

		if (relation) {
			console.log('relation deja creer');
			if (relation.relation === 1){
				console.log('deja ami');
				return relation;
			}
			else {
				console.log("update de la relation");
				const updateRelation = await this.prisma.relation.update({where: {id: relation.id}, 
				data: {
					relation: 1,
				}})
				return updateRelation;
			}
		}
		else {
			try {
				var newRelation = await this.prisma.relation.create({data: {
					userId: meId,
					userIWatchId: friendId,	
					relation: 1,
					}});
				}
			catch (e) {
				throw new ForbiddenException('error');
				}
			console.log("je creer la relation");
			var num = meId.toString();
			let curlyAchiv = await this.achivService.findUserForAchivId(num, "4")
			if (!curlyAchiv) {
				console.log("je go faire l'achiv");
				this.achivService.updateAchiv(num, "4");
			}
			return newRelation;
		}
	}

	/* remove_friend */
	async remove_friend(meId: number, userId: string) {
		let friendId = parseInt(userId, 10);

		let findMe = await this.prisma.user.findFirst({where: {id: meId} })
		let findFriend = await this.prisma.user.findFirst({where: {id: friendId}})

		if (!findMe)
			throw new ForbiddenException('u not exist')
		if (!findFriend)
			throw new ForbiddenException('u r friend not exist')

		let relation = await this.prisma.relation.findFirst({where: {userId: meId, userIWatchId: friendId}})

		if (relation) {
			if (relation.relation === 1){
				if (relation.isBlock === 1) {
					var updateRelation = await this.prisma.relation.update({where: {id: relation.id}, data: {relation: 0}})
					return ;
				}
				else {
					const deleteRelation = await this.prisma.relation.delete({where: {id: relation.id}})
					return ;
				}
			}
		}
		return ;	

	}


}