import { createFileRoute, Link } from '@tanstack/react-router'
import { Users, Heart, ArrowLeft, MessageCircle, Search, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/auth'
import { usePregnancyProfileStore } from '@/stores/pregnancy-profile'

export const Route = createFileRoute('/community')({
  component: CommunityPage,
})

interface ForumPost {
  id: string
  title: string
  author: string
  authorAvatar?: string
  category: string
  replies: number
  views: number
  lastActivity: Date
  isPinned?: boolean
  tags: string[]
}

interface Group {
  id: string
  name: string
  description: string
  memberCount: number
  icon: string
  isJoined?: boolean
}

function CommunityPage() {
  const { } = useTranslation()
  const { } = useAuthStore()
  const { } = usePregnancyProfileStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [joinedGroups, setJoinedGroups] = useState<string[]>(['1', '3'])
  
  const forumPosts: ForumPost[] = [
    {
      id: '1',
      title: 'First trimester exhaustion - when does it get better?',
      author: 'Sarah M.',
      category: 'First Trimester',
      replies: 23,
      views: 156,
      lastActivity: new Date(Date.now() - 3600000),
      isPinned: true,
      tags: ['fatigue', 'first-trimester', 'tips']
    },
    {
      id: '2',
      title: 'Recommended prenatal vitamins that don\'t cause nausea?',
      author: 'Emily K.',
      category: 'Health & Nutrition',
      replies: 45,
      views: 289,
      lastActivity: new Date(Date.now() - 7200000),
      tags: ['vitamins', 'morning-sickness', 'recommendations']
    },
    {
      id: '3',
      title: 'Anyone else due in March 2024? Let\'s connect!',
      author: 'Jessica L.',
      category: 'Due Date Groups',
      replies: 67,
      views: 512,
      lastActivity: new Date(Date.now() - 10800000),
      tags: ['march-2024', 'due-date-buddies']
    },
    {
      id: '4',
      title: 'Tips for telling family about pregnancy',
      author: 'Maria G.',
      category: 'Relationships',
      replies: 31,
      views: 198,
      lastActivity: new Date(Date.now() - 14400000),
      tags: ['announcement', 'family', 'advice']
    },
    {
      id: '5',
      title: 'Nursery setup ideas on a budget',
      author: 'Amanda R.',
      category: 'Baby Preparation',
      replies: 52,
      views: 421,
      lastActivity: new Date(Date.now() - 86400000),
      tags: ['nursery', 'budget', 'diy']
    }
  ]

  const groups: Group[] = [
    {
      id: '1',
      name: 'March 2024 Due Date',
      description: 'Connect with moms due in March 2024',
      memberCount: 342,
      icon: '📅'
    },
    {
      id: '2',
      name: 'First Time Moms',
      description: 'Support and advice for first-time mothers',
      memberCount: 1205,
      icon: '👶'
    },
    {
      id: '3',
      name: 'TTC Community',
      description: 'Trying to conceive support group',
      memberCount: 856,
      icon: '💝'
    },
    {
      id: '4',
      name: 'High-Risk Pregnancy',
      description: 'Support for high-risk pregnancies',
      memberCount: 423,
      icon: '🏥'
    },
    {
      id: '5',
      name: 'Rainbow Babies',
      description: 'Pregnancy after loss support',
      memberCount: 267,
      icon: '🌈'
    },
    {
      id: '6',
      name: 'Working Moms',
      description: 'Balancing pregnancy and career',
      memberCount: 789,
      icon: '💼'
    }
  ]

  const handleJoinGroup = (groupId: string) => {
    setJoinedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  const filteredPosts = forumPosts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
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
              <h1 className="text-2xl font-bold">Community</h1>
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search discussions, topics, or groups..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="forums" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="forums">Forums</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="my-activity">My Activity</TabsTrigger>
          </TabsList>

          {/* Forums Tab */}
          <TabsContent value="forums" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Forum Posts */}
              <div className="lg:col-span-2 space-y-4">
                <h2 className="text-xl font-semibold">Recent Discussions</h2>
                {filteredPosts.map((post) => (
                  <Card key={post.id} className={post.isPinned ? 'border-primary' : ''}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {post.isPinned && (
                              <Badge variant="secondary" className="bg-primary text-white">
                                Pinned
                              </Badge>
                            )}
                            <Badge variant="outline">{post.category}</Badge>
                          </div>
                          <h3 className="font-semibold mb-2 hover:text-primary cursor-pointer">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-xs">
                                  {post.author.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span>{post.author}</span>
                            </div>
                            <span>•</span>
                            <span>{getTimeAgo(post.lastActivity)}</span>
                          </div>
                          <div className="flex gap-2 mt-2">
                            {post.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-end text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.replies}</span>
                          </div>
                          <span className="text-xs">{post.views} views</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Popular Topics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Trending Topics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {['Morning Sickness', 'Baby Names', 'Labor Stories', 'Maternity Fashion', 'Nursery Ideas'].map((topic, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-sm">{topic}</span>
                          <Badge variant="secondary">{Math.floor(Math.random() * 50 + 10)}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Community Stats */}
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Community Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Active Members</span>
                        <span className="font-medium">5,234</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Posts</span>
                        <span className="font-medium">12,456</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">New Today</span>
                        <span className="font-medium">47</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="space-y-4">
            <h2 className="text-xl font-semibold">Join Groups</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => {
                const isJoined = joinedGroups.includes(group.id)
                return (
                  <Card key={group.id} className={isJoined ? 'border-primary' : ''}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <span className="text-3xl mr-3">{group.icon}</span>
                          <div>
                            <CardTitle className="text-lg">{group.name}</CardTitle>
                            <p className="text-xs text-gray-600 mt-1">
                              {group.memberCount} members
                            </p>
                          </div>
                        </div>
                        {isJoined && (
                          <Badge variant="default">Joined</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">{group.description}</p>
                      <Button
                        className="w-full"
                        variant={isJoined ? 'outline' : 'default'}
                        onClick={() => handleJoinGroup(group.id)}
                      >
                        {isJoined ? 'Leave Group' : 'Join Group'}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* My Activity Tab */}
          <TabsContent value="my-activity">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Posts */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Recent Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <p className="font-medium mb-1">Tips for dealing with morning sickness</p>
                      <p className="text-sm text-gray-600">Posted 2 days ago • 15 replies</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="font-medium mb-1">When did you announce your pregnancy?</p>
                      <p className="text-sm text-gray-600">Posted 5 days ago • 32 replies</p>
                    </div>
                    <Button variant="outline" className="w-full">
                      View All Posts
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl mb-1">🌟</div>
                      <p className="text-xs">Active Member</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl mb-1">💬</div>
                      <p className="text-xs">Helpful Contributor</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl mb-1">❤️</div>
                      <p className="text-xs">Supportive Friend</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl mb-1">📝</div>
                      <p className="text-xs">Story Teller</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl mb-1">🎯</div>
                      <p className="text-xs">Topic Starter</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl mb-1">🏆</div>
                      <p className="text-xs">Top Poster</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Community Guidelines */}
        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Community Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Be respectful and supportive of all members</li>
              <li>• No medical advice - always consult your healthcare provider</li>
              <li>• Keep discussions pregnancy and parenting related</li>
              <li>• Respect privacy - don't share personal information</li>
              <li>• Report inappropriate content to moderators</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}