// Extern:
import React from "react";
import { useNavigate, Outlet } from 'react-router-dom'

// Intern:
import { Friendsbar, Navbar } from '../components'
import { IUser } from "../types";

// Assets:
import '../styles/pages/Home.css'
import bg_website from '../assets/videos/bg_website.webm'
import { useAxios } from "../hooks/useAxios";

function LoadingHome() {
	return (
		<div>
			<video src={bg_website} autoPlay loop muted className='bg_video' />
		</div>
	)
}

export function Home() {
	const navigate = useNavigate();
	const [loading, user, error] = useAxios<IUser>({ method: 'GET', url: '/user/me'});

	if (loading) return <LoadingHome />
	if (error !== '') return navigate('/');
	if (!user) return navigate('/');
	
	return (
		<div>
			<Navbar me={user} />
			<div className='container-body'>
				{/* <video src={bg_website} autoPlay loop className='bg_video' /> */}
				<Outlet context={user} />
				<Friendsbar userId={user.id} />
			</div>
		</div>
	)
}