import { useParams, useNavigate } from 'react-router-dom';
import VideoCall from '@/components/ui/VideoCall';
import { useSelector } from 'react-redux';
import { type RootState } from '@/redux/store';
import { ROUTES } from '@/constants/routes';

export default function VideoCallPage() {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const isTrainer = useSelector((state: RootState) => state.trainerAuth.isAuthenticated);

    if (!roomId) {
        navigate('/');
        return null;
    }

    const handleLeave = () => {
        if (isTrainer) {
            navigate(ROUTES.TRAINER_DASHBOARD);
        } else {
            navigate(ROUTES.USER_DASHBOARD);
        }
    };

    return <VideoCall roomId={roomId} onLeave={handleLeave} />;
}