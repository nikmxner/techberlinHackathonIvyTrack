'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { UserAvatar } from '@/components/auth/UserAvatar'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Users, Building } from 'lucide-react'

interface User {
  id: string
  email: string
  created_at: string
}

interface Merchant {
  id: string
  name: string
  category: string | null
}

interface UserMerchantAssignment {
  id: string
  user_id: string
  merchant_id: string
  role: 'admin' | 'manager' | 'viewer'
  user: User
  merchant: Merchant
}

function AdminContent() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [assignments, setAssignments] = useState<UserMerchantAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  
  // New assignment form
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('')
  const [selectedRole, setSelectedRole] = useState<'admin' | 'manager' | 'viewer'>('viewer')

  const supabase = createClient()

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load users from auth.users (need RLS bypass or special access)
      const { data: usersData, error: usersError } = await supabase.rpc('get_all_users')
      
      // If RPC doesn't exist, we'll show current user only for now
      if (usersError) {
        console.log('Cannot load all users, showing current user only')
        setUsers(currentUser ? [{ 
          id: currentUser.id, 
          email: currentUser.email || '', 
          created_at: new Date().toISOString() 
        }] : [])
      } else {
        setUsers(usersData || [])
      }

      // Load merchants
      const { data: merchantsData, error: merchantsError } = await supabase
        .from('merchants')
        .select('id, name, category')
        .eq('status', 'active')
        .order('name')

      if (merchantsError) {
        console.error('Error loading merchants:', merchantsError)
      } else {
        setMerchants(merchantsData || [])
      }

      // Load current assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('user_merchants')
        .select(`
          id,
          user_id,
          merchant_id,
          role,
          merchant:merchants(id, name, category)
        `)
        .order('created_at', { ascending: false })

      if (assignmentsError) {
        console.error('Error loading assignments:', assignmentsError)
      } else {
        // Add user info to assignments and fix merchant type
        const enrichedAssignments = (assignmentsData || []).map(assignment => ({
          ...assignment,
          merchant: Array.isArray(assignment.merchant) ? assignment.merchant[0] : assignment.merchant,
          user: users.find(u => u.id === assignment.user_id) || { 
            id: assignment.user_id, 
            email: 'Unknown User', 
            created_at: '' 
          }
        }))
        setAssignments(enrichedAssignments)
      }
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [currentUser])

  const createAssignment = async () => {
    if (!selectedUserId || !selectedMerchantId) return

    try {
      setCreating(true)
      
      const { error } = await supabase
        .from('user_merchants')
        .insert({
          user_id: selectedUserId,
          merchant_id: selectedMerchantId,
          role: selectedRole
        })

      if (error) {
        alert('Fehler beim Erstellen der Zuordnung: ' + error.message)
      } else {
        alert('Zuordnung erfolgreich erstellt!')
        setSelectedUserId('')
        setSelectedMerchantId('')
        setSelectedRole('viewer')
        loadData()
      }
    } catch (error) {
      alert('Unerwarteter Fehler: ' + error)
    } finally {
      setCreating(false)
    }
  }

  const deleteAssignment = async (assignmentId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Zuordnung löschen möchten?')) return

    try {
      const { error } = await supabase
        .from('user_merchants')
        .delete()
        .eq('id', assignmentId)

      if (error) {
        alert('Fehler beim Löschen: ' + error.message)
      } else {
        alert('Zuordnung erfolgreich gelöscht!')
        loadData()
      }
    } catch (error) {
      alert('Unerwarteter Fehler: ' + error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-white">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <UserAvatar />
          </div>
        </header>
        <div className="p-6 text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <UserAvatar />
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Create New Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Neue Merchant-Zuordnung erstellen
            </CardTitle>
            <CardDescription>
              Gewähren Sie einem Benutzer Zugriff auf einen Merchant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Benutzer</label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Benutzer wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Merchant</label>
                <Select value={selectedMerchantId} onValueChange={setSelectedMerchantId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Merchant wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {merchants.map(merchant => (
                      <SelectItem key={merchant.id} value={merchant.id}>
                        {merchant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Rolle</label>
                <Select value={selectedRole} onValueChange={(value: 'admin' | 'manager' | 'viewer') => setSelectedRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={createAssignment} 
                  disabled={!selectedUserId || !selectedMerchantId || creating}
                  className="w-full"
                >
                  {creating ? 'Erstelle...' : 'Erstellen'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Aktuelle Zuordnungen ({assignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Noch keine Zuordnungen vorhanden
              </p>
            ) : (
              <div className="space-y-2">
                {assignments.map(assignment => (
                  <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{assignment.user.email}</p>
                        <p className="text-sm text-muted-foreground">
                          {assignment.merchant.name}
                        </p>
                      </div>
                      <Badge variant={assignment.role === 'admin' ? 'default' : 'secondary'}>
                        {assignment.role}
                      </Badge>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteAssignment(assignment.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Copy User IDs */}
        <Card>
          <CardHeader>
            <CardTitle>User IDs für manuelle Zuordnung</CardTitle>
            <CardDescription>
              Kopieren Sie diese IDs für manuelle SQL-Commands
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{user.email}</span>
                  <code className="text-xs bg-background p-1 rounded">{user.id}</code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminContent />
    </ProtectedRoute>
  )
} 