
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import { useJobs } from '@/contexts/JobContext';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Calendar, DollarSign, User, Heart, Bookmark } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { CommentItem } from '@/components/Comments/CommentItem';

const JobDetail = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { getJob, addComment, toggleSavedJob, toggleLike, savedJobs } = useJobs();
  const { currentUser } = useAuth();
  const { createChat } = useChat();
  const { getUserById } = useData();
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  const job = jobId ? getJob(jobId) : undefined;
  const jobOwner = job ? getUserById(job.userId) : undefined;
  const isJobSaved = job && savedJobs.includes(job.id);
  const hasUserLiked = job && currentUser ? job.likes.includes(currentUser.id) : false;
  
  if (!job) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold">Propuesta no encontrada</h2>
          <p className="text-gray-600 mt-2">La propuesta que estás buscando no existe o ha sido eliminada.</p>
          <Button className="mt-4" onClick={() => navigate('/jobs')}>
            Ver todas las propuestas
          </Button>
        </div>
      </MainLayout>
    );
  }

  const handleContactClick = () => {
    if (!currentUser || !jobOwner) return;
    
    // Crear chat privado con el dueño de la propuesta
    createChat([currentUser.id, job.userId]);
    navigate('/chats');
    toast({
      title: "Chat iniciado",
      description: `Has iniciado una conversación con ${jobOwner.name}`
    });
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !currentUser) return;
    
    setIsSubmittingComment(true);
    try {
      await addComment(job.id, commentText, currentUser);
      setCommentText('');
      toast({
        title: "Comentario enviado",
        description: "Tu comentario ha sido publicado correctamente"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo enviar el comentario"
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleToggleSave = () => {
    if (!currentUser || !job) return;
    
    toggleSavedJob(job.id, currentUser.id);
    toast({
      title: isJobSaved ? "Propuesta eliminada de guardados" : "Propuesta guardada",
      description: isJobSaved 
        ? "La propuesta ha sido eliminada de tus guardados" 
        : "La propuesta ha sido añadida a tus guardados"
    });
  };

  const handleToggleLike = () => {
    if (!currentUser || !job) return;
    
    toggleLike(job.id, currentUser.id);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <p className="text-gray-600 mt-1">
              Publicado por {job.userName} • {formatDate(job.timestamp)}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={`
              ${job.status === 'open' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 
                job.status === 'in-progress' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 
                'bg-gray-100 text-gray-800 hover:bg-gray-200'}
            `}>
              {job.status === 'open' ? 'Abierto' : 
               job.status === 'in-progress' ? 'En progreso' : 
               'Completado'}
            </Badge>
            
            {currentUser && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleToggleLike}
                  className={hasUserLiked ? "text-red-500" : "text-gray-400"}
                >
                  <Heart className={`h-5 w-5 ${hasUserLiked ? "fill-red-500" : ""}`} />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleToggleSave}
                  className={isJobSaved ? "text-wfc-purple" : "text-gray-400"}
                >
                  <Bookmark className={`h-5 w-5 ${isJobSaved ? "fill-wfc-purple" : ""}`} />
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Contenido principal */}
          <div className="md:col-span-2 space-y-6">
            {/* Descripción */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
                
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Habilidades requeridas</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="bg-gray-50">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 flex items-center">
                  <Heart className={`h-5 w-5 mr-1 ${job.likes.length > 0 ? "text-red-500 fill-red-500" : "text-gray-400"}`} />
                  <span className="text-sm">{job.likes.length} {job.likes.length === 1 ? "like" : "likes"}</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Comentarios */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Comentarios</CardTitle>
                <CardDescription>
                  {job.comments.length === 0 ? 'No hay comentarios aún' : `${job.comments.length} comentarios`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {job.comments.length > 0 && (
                  <div className="space-y-4 mb-6">
                    {job.comments.map((comment) => (
                      <CommentItem key={comment.id} comment={comment} jobId={job.id} />
                    ))}
                  </div>
                )}
                
                {/* Formulario de comentario */}
                {currentUser && job.status === 'open' && (
                  <div className="space-y-4">
                    <Separator />
                    <h3 className="text-sm font-medium">Deja un comentario</h3>
                    <Textarea
                      placeholder="Escribe tu comentario aquí..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <Button 
                      onClick={handleSubmitComment} 
                      disabled={isSubmittingComment || !commentText.trim()}
                      className="bg-wfc-purple hover:bg-wfc-purple-medium"
                    >
                      {isSubmittingComment ? 'Enviando...' : 'Enviar comentario'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Detalles de la propuesta */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalles de la propuesta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <h4 className="text-sm text-gray-600">Presupuesto</h4>
                    <p className="font-medium">${job.budget}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                  <div>
                    <h4 className="text-sm text-gray-600">Fecha de publicación</h4>
                    <p className="font-medium">{formatDate(job.timestamp)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 mr-2">
                    {job.category}
                  </Badge>
                  <span className="text-sm text-gray-600">Categoría</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Información del cliente */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={job.userPhoto} alt={job.userName} />
                    <AvatarFallback className="bg-wfc-purple-medium text-white">
                      {job.userName?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{job.userName}</p>
                  </div>
                </div>
                
                {currentUser && currentUser.id !== job.userId && (
                  <Button
                    variant="outline"
                    className="w-full mt-2 border-wfc-purple text-wfc-purple hover:bg-wfc-purple/10"
                    onClick={handleContactClick}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contactar
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/user/${job.userId}`)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Ver perfil
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default JobDetail;
