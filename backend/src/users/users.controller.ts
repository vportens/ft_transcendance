import { Body, Controller, Get, Param, ParseIntPipe, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './users.service';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { User } from '@prisma/client'
import { EditUserDto } from './dto/edit-user.dto';


@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
	constructor( private userService: UserService) {};

	@Get('all')
	getAllUsers() {
		return this.userService.getAllUser();
	}

	@UseGuards(JwtGuard)	//	PASS GLOBALLY TO CONTROLLER LATER
	@Get('me')
	getme(@GetUser() user: User) {
		return user;
	}

	@Get(':id')
	getUserById( @Param('id', ParseIntPipe) userId: number ) {
		return this.userService.getUser(userId);
	}

	@UseGuards(JwtGuard)	//	PASS GLOBALLY TO CONTROLLER LATER
	@Patch()
	editUser(
		@GetUser('id') userId: number,
		@Body() dto: EditUserDto
	) {
		return (this.userService.editUser(userId, dto));
	}

}

