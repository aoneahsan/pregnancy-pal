import { createFileRoute, Link } from '@tanstack/react-router'
import { Calendar, Heart, Plus, Clock, MapPin, User, FileText, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth'
import { format, addDays, isFuture, isPast, isToday } from 'date-fns'

export const Route = createFileRoute('/appointments')({
  component: AppointmentsPage,
})

interface Appointment {
  id: string
  title: string
  doctorName: string
  location: string
  date: Date
  time: string
  type: 'checkup' | 'ultrasound' | 'lab' | 'specialist' | 'other'
  notes?: string
  reminder?: boolean
}

function AppointmentsPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  
  // Mock appointments data
  const [appointments] = useState<Appointment[]>([
    {
      id: '1',
      title: 'Regular Checkup',
      doctorName: 'Dr. Sarah Johnson',
      location: 'Women\'s Health Clinic',
      date: addDays(new Date(), 3),
      time: '10:00 AM',
      type: 'checkup',
      notes: 'Bring previous test results',
      reminder: true
    },
    {
      id: '2',
      title: '20-Week Ultrasound',
      doctorName: 'Dr. Michael Chen',
      location: 'Imaging Center',
      date: addDays(new Date(), 10),
      time: '2:30 PM',
      type: 'ultrasound',
      notes: 'Anatomy scan',
      reminder: true
    },
    {
      id: '3',
      title: 'Glucose Screening',
      doctorName: 'Lab Technician',
      location: 'Medical Lab',
      date: addDays(new Date(), 15),
      time: '8:00 AM',
      type: 'lab',
      notes: 'Fasting required',
      reminder: true
    }
  ])

  const upcomingAppointments = appointments.filter(apt => isFuture(apt.date) || isToday(apt.date))
  const pastAppointments = appointments.filter(apt => isPast(apt.date) && !isToday(apt.date))

  const getAppointmentIcon = (type: string) => {
    switch(type) {
      case 'ultrasound': return '🔊'
      case 'lab': return '🧪'
      case 'specialist': return '👩‍⚕️'
      case 'checkup': return '🩺'
      default: return '📋'
    }
  }

  const getAppointmentColor = (type: string) => {
    switch(type) {
      case 'ultrasound': return 'bg-purple-100 border-purple-300'
      case 'lab': return 'bg-blue-100 border-blue-300'
      case 'specialist': return 'bg-green-100 border-green-300'
      case 'checkup': return 'bg-pink-100 border-pink-300'
      default: return 'bg-gray-100 border-gray-300'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pregnancy-pink-50 via-white to-pregnancy-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-primary mr-2" />
              <h1 className="text-2xl font-bold">{t('dashboard.tabs.appointments')}</h1>
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Appointment
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Appointments */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <Card key={appointment.id} className={`${getAppointmentColor(appointment.type)} border-2`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            <span className="text-2xl mr-3">{getAppointmentIcon(appointment.type)}</span>
                            <div>
                              <CardTitle className="text-lg">{appointment.title}</CardTitle>
                              <CardDescription className="mt-1">
                                {format(appointment.date, 'EEEE, MMMM d, yyyy')}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant={isToday(appointment.date) ? 'default' : 'outline'}>
                            {isToday(appointment.date) ? 'Today' : `In ${Math.ceil((appointment.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days`}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{appointment.time}</span>
                          </div>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{appointment.doctorName}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{appointment.location}</span>
                          </div>
                          {appointment.notes && (
                            <div className="flex items-start">
                              <FileText className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
                              <span className="text-gray-600">{appointment.notes}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline" className="flex-1">
                            Reschedule
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            Add to Calendar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">No upcoming appointments</p>
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Appointment
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Past Appointments */}
            {pastAppointments.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Past Appointments</h2>
                <div className="space-y-3">
                  {pastAppointments.map((appointment) => (
                    <Card key={appointment.id} className="opacity-75">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-lg mr-3">{getAppointmentIcon(appointment.type)}</span>
                            <div>
                              <p className="font-medium">{appointment.title}</p>
                              <p className="text-sm text-gray-500">
                                {format(appointment.date, 'MMM d, yyyy')} at {appointment.time}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost">
                            View Notes
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Appointment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Appointments</span>
                    <span className="font-medium">{appointments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Upcoming</span>
                    <span className="font-medium">{upcomingAppointments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="font-medium">{pastAppointments.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommended Appointments */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="text-lg">Recommended Schedule</CardTitle>
                <CardDescription>Based on your pregnancy stage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="p-2 bg-white rounded-lg">
                    <p className="font-medium">First Trimester</p>
                    <p className="text-xs text-gray-600">Initial visit, lab tests, dating ultrasound</p>
                  </div>
                  <div className="p-2 bg-white rounded-lg">
                    <p className="font-medium">Second Trimester</p>
                    <p className="text-xs text-gray-600">Monthly checkups, anatomy scan (18-22 weeks)</p>
                  </div>
                  <div className="p-2 bg-white rounded-lg">
                    <p className="font-medium">Third Trimester</p>
                    <p className="text-xs text-gray-600">Bi-weekly, then weekly checkups</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Tests */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Important Tests</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="mr-2">🩸</span>
                    <div>
                      <p className="font-medium">Blood Tests</p>
                      <p className="text-xs text-gray-600">8-12 weeks</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">🔊</span>
                    <div>
                      <p className="font-medium">NT Scan</p>
                      <p className="text-xs text-gray-600">11-14 weeks</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">👶</span>
                    <div>
                      <p className="font-medium">Anatomy Scan</p>
                      <p className="text-xs text-gray-600">18-22 weeks</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">🍬</span>
                    <div>
                      <p className="font-medium">Glucose Test</p>
                      <p className="text-xs text-gray-600">24-28 weeks</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}