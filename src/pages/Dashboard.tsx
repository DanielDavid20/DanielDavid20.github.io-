
import MainLayout from '@/components/Layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useJobs } from '@/contexts/JobContext';
import { useChat } from '@/contexts/ChatContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Briefcase, MessageCircle, Timer, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { jobs, loading: loadingJobs } = useJobs();
  const { chats, loadingChats } = useChat();

  // Filtrar propuestas recientes
  const recentJobs = [...jobs].sort((a, b) => b.timestamp - a.timestamp).slice(0, 3);

  // Filtrar chats con mensajes recientes
  const recentChats = [...chats]
    .filter(chat => chat.lastMessage)
    .sort((a, b) => {
      const timestampA = a.lastMessage?.timestamp || 0;
      const timestampB = b.lastMessage?.timestamp || 0;
      return timestampB - timestampA;
    })
    .slice(0, 3);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Bienvenida */}
        <div className="pb-4 border-b border-gray-200">
          <h1 className="text-2xl sm:text-3xl font-bold">¡Bienvenido, {currentUser?.name}!</h1>
          <p className="text-gray-600 mt-2">Esto es lo que está pasando en WorkFlowConnect hoy.</p>
        </div>
        
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Propuestas</CardTitle>
              <CardDescription>Propuestas activas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-wfc-purple" />
                <span className="text-2xl font-bold ml-2">
                  {loadingJobs ? '...' : jobs.filter(j => j.status === 'open').length}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Mensajes</CardTitle>
              <CardDescription>Chats activos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <MessageCircle className="h-8 w-8 text-wfc-purple" />
                <span className="text-2xl font-bold ml-2">
                  {loadingChats ? '...' : chats.length}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Actividad</CardTitle>
              <CardDescription>Última conexión</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Timer className="h-8 w-8 text-wfc-purple" />
                <span className="text-2xl font-bold ml-2">Hoy</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Propuestas recientes */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Propuestas recientes</h2>
            <Link to="/jobs">
              <Button variant="ghost" className="text-wfc-purple">
                Ver todas <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          {loadingJobs ? (
            <div className="text-center py-8">Cargando propuestas...</div>
          ) : recentJobs.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">No hay propuestas disponibles</p>
              <Link to="/create-job">
                <Button className="mt-4 bg-wfc-purple hover:bg-wfc-purple-medium">
                  Crear propuesta
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {recentJobs.map((job) => (
                <Link key={job.id} to={`/jobs/${job.id}`}>
                  <Card className="hover:border-wfc-purple transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg font-medium">{job.title}</CardTitle>
                          <CardDescription className="text-sm">
                            Publicado por {job.userName} • {formatDate(job.timestamp)}
                          </CardDescription>
                        </div>
                        <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          {job.status === 'open' ? 'Abierto' : job.status === 'in-progress' ? 'En progreso' : 'Completado'}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-sm line-clamp-2">{job.description}</p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {job.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
        
        {/* Mensajes recientes */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Mensajes recientes</h2>
            <Link to="/chats">
              <Button variant="ghost" className="text-wfc-purple">
                Ver todos <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          {loadingChats ? (
            <div className="text-center py-8">Cargando mensajes...</div>
          ) : recentChats.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">No hay mensajes recientes</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {recentChats.map((chat) => (
                <Link key={chat.id} to="/chats">
                  <Card className="hover:border-wfc-purple transition-colors">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-wfc-purple/20 flex items-center justify-center text-wfc-purple font-semibold">
                            {chat.isGroup ? chat.name.charAt(0) : currentUser?.id === chat.participants[0] ? 'U' : 'T'}
                          </div>
                          <div className="ml-3">
                            <h3 className="font-medium">
                              {chat.isGroup ? chat.name : 'Chat privado'}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-1">
                              {chat.lastMessage?.content}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {chat.lastMessage ? new Date(chat.lastMessage.timestamp).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : ''}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
