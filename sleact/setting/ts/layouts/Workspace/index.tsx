import React, { VFC, useCallback, useState, useEffect } from 'react';
import useInput from '@hooks/useInput';
import useSocket from '@hooks/useSocket';
import Menu from '@components/Menu';
import Modal from '@components/Modal';
import DMList from '@components/DMList';
import ChannelList from '@components/ChannelList';
import InviteChannelModal from '@components/InviteChannelModal';
import InviteWorkspaceModal from '@components/InviteWorkspaceModal';
import CreateChannelModal from '@components/CreateChannelModal'
import { Header, RightMenu, ProfileImg, WorkspaceWrapper, Workspaces, Channels, AddButton,
	WorkspaceButton, ProfileModal,	Chats	,WorkspaceName, MenuScroll, LogOutButton, WorkspaceModal	 } from '@layouts/Workspace/styles';
import loadable from '@loadable/component';
const Channel = loadable(() => import('@pages/Channel'));
const DirectMessage = loadable(() => import('@pages/DirectMessage'));
import { Route, Switch, Link, useParams } from 'react-router-dom'
import { IChannel, IUser } from '@typings/db';
import axios from 'axios';
import fetcher from '@utils/fetcher';
import useSWR from 'swr';
import { Redirect } from 'react-router';
import gravatar from 'gravatar'
import { Button, Input, Label } from '@pages/SignUp/styles';


const Workspace: VFC = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false);
  const [showInviteWorkspaceModal, setShowInviteWorkspaceModal] = useState(false);
  const [showInviteChannelModal, setShowInviteChannelModal] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [newWorkspace, onChangeNewWorkspace, setNewWorkpsace] = useInput('');
  const [newUrl, onChangeNewUrl, setNewUrl] = useInput('');
	
	
	const { workspace, channel } = useParams<{ workspace: string; channel: string }>();
	const { data: userData, error, revalidate, mutate } = useSWR<IUser | false>(
		'https://sleactserver.run.goorm.io/api/users',
		fetcher
	);
	
	const { data: channelData } = useSWR<IChannel[]>(
		userData ? `https://sleactserver.run.goorm.io/api/workspaces/${workspace}/channels` : null,
		fetcher
	);
	
	const { data: memberData } = useSWR<IUser[]>(
    userData ? `https://sleactserver.run.goorm.io/api/workspaces/${workspace}/members` : null,
    fetcher,
  );
	
	const [socket, disconnect] = useSocket(workspace);
	
	useEffect(()=> {
		if(channelData && userData && socket) {
			console.log(socket);
			socket.emit('login', { id: userData.id, channels: channelData.map((v) => v.id)});
		}
		
	}, [socket, channelData, userData]);
	
	useEffect(()=> {
		return () => {
			disconnect();
		}
	}, [workspace, disconnect]);
	
	const onLogout = useCallback(()=> {
		axios.post('https://sleactserver.run.goorm.io/api/users/logout', null, {
			withCredentials: true,
		})
			.then(()=> {
				mutate(false);
		})
	}, []);
	
	const onClickUserProfile = useCallback((e)=> {
		e.stopPropagation();
		setShowUserMenu(prev => !prev);
	}, []);
	
	const onClickCreateWorkspace = useCallback(()=> {
		setShowCreateWorkspaceModal(true);
	}, []);
	
	const onCreateWorkspace = useCallback((e) => {
		e.preventDefault();
		if(!newWorkspace || !newWorkspace.trim()) return; // 둘다 false 이면 return
		if(!newUrl || !newUrl.trim()) return;
		axios.post('https://sleactserver.run.goorm.io/api/workspaces', {
			workspace: newWorkspace,
			url: newUrl,
		}, {
			withCredentials: true,
		})
			.then(()=> {
			revalidate();
			setShowCreateWorkspaceModal(false);
			setNewUrl('');
			setNewWorkpsace('');
			})
			.catch((error) => {
			console.log(error);
			});
	}, [newUrl, newWorkspace]);
	
	const onCloseModal = useCallback(() => {
    setShowCreateWorkspaceModal(false);
		setShowCreateChannelModal(false);
		setShowInviteWorkspaceModal(false);
		setShowWorkspaceModal(false);
	}, []);
	
	const toggleWorkspaceModal = useCallback(()=> {
		setShowWorkspaceModal(prev => !prev);
	}, []); 
	
	const onClickAddChannel = useCallback(()=> {
		setShowCreateChannelModal(true);
	}, []);
	
	const onClickInviteWorkspace = useCallback(()=> {
		setShowInviteWorkspaceModal(true);
	}, []);
	
	
	
	
	if (!userData) {
		return <Redirect to="/login" />;
	}
	
	return (
		<div>
			<Header>
				<RightMenu>
					<span onClick={onClickUserProfile}>
						<ProfileImg src={gravatar.url(userData.email, {s: '28px', d: 'retro'})} alt={userData.nickname} />
						{showUserMenu &&(
							<Menu style={{ right: 0, top: 38 }} show={showUserMenu} onCloseModal={onClickUserProfile}>
								<ProfileModal>
									<img src={gravatar.url(userData.email, {s: '36px', d: 'retro'})} alt={userData.nickname} />
									<div>
										<span id="profile-name">{userData.nickname}</span>
										<span id="profile-active">Active</span>
									</div>
								</ProfileModal>
								<LogOutButton onClick={onLogout}>로그아웃</LogOutButton>
							</Menu>
						)}
					</span>
				</RightMenu>
			</Header>
			<WorkspaceWrapper>
				<Workspaces>
					{userData.Workspaces && userData?.Workspaces?.map((ws) => {
						return (
							<Link key={ws.id} to={`/workspace/${123}/channel/일반`}>
								<WorkspaceButton>{ws.name.slice(0, 1).toUpperCase()}</WorkspaceButton>
							</Link>
						);
					})}
					<AddButton onClick={onClickCreateWorkspace}>+</AddButton>
				</Workspaces>
				<Channels>
					<WorkspaceName onClick={toggleWorkspaceModal}>Sleact</WorkspaceName>
					<MenuScroll>
						<Menu show={showWorkspaceModal} onCloseModal={toggleWorkspaceModal} style={{ top: 95, left: 80}}>
							<WorkspaceModal>
								<h2>Sleact!</h2>
								<button onClick={onClickInviteWorkspace}>워크스페이스에 사용자 초대</button>
								<button onClick={onClickAddChannel}>채널만들기</button>
								<button onClick={onLogout}>로그아웃</button> 
							</WorkspaceModal>
						</Menu>
						<ChannelList />
						<DMList userData={userData}/>
					</MenuScroll>
				</Channels>
				<Chats>
					<Switch>
						<Route path="/workspace/:workspace/channel/:channel" component={Channel} />
						<Route path="/workspace/:workspace/dm/:id" component={DirectMessage} />
					</Switch>
				</Chats>
			</WorkspaceWrapper>
			
			<Modal show={showCreateWorkspaceModal} onCloseModal={onCloseModal}>
				<form onSubmit={onCreateWorkspace}>
					<Label id="workspace-label">
						<span>워크스페이스 이름</span>
						<Input id="workspace" value={newWorkspace} onChange={onChangeNewWorkspace} />
					</Label>
					<Label id="workspace-label">
						<span>워크스페이스 URL</span>
						<Input id="workspace" value={newUrl} onChange={onChangeNewUrl} />
					</Label>
					<Button type="submit">생성하기</Button>
				</form>
			</Modal>
			<CreateChannelModal 
				show={showCreateChannelModal}
				onCloseModal={onCloseModal}
				setShowCreateChannelModal={setShowCreateChannelModal}
			/>
			 <InviteWorkspaceModal
        show={showInviteWorkspaceModal}
        onCloseModal={onCloseModal}
        setShowInviteWorkspaceModal={setShowInviteWorkspaceModal}
      />
			<InviteChannelModal
        show={showInviteChannelModal}
        onCloseModal={onCloseModal}
        setShowInviteChannelModal={setShowInviteChannelModal}
      />
		</div>	
	);
};

export default Workspace;

