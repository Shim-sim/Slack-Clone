import { io, Socket } from 'socket.io-client';
import { useCallback } from 'react';

const backUrl = 'https://sleactserver.run.goorm.io';

const sockets: { [key: string]: Socket } = {};
const useSocket = (workspace?: string): [Socket | undefined, () => void] => {
	const disconnect = useCallback(()=> {
		if(workspace) {
			sockets[workspace].disconnect();
			delete sockets[workspace];
		}
	}, [workspace]);
	
	if(!workspace) {
		return [undefined, disconnect];
	}
	
	if(!sockets[workspace]) {
		sockets[workspace] = io(`${backUrl}/ws-${workspace}`, {
		transports: ['websocket'],
	});
	}
	
	return [sockets[workspace], disconnect];
}

export default useSocket;