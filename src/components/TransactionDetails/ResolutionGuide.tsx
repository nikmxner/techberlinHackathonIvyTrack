'use client'

import { useState } from 'react'
import { Transaction, DocumentationLink } from '@/types/transactions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Brain, 
  CheckCircle, 
  Clock, 
  ExternalLink, 
  FileText, 
  HelpCircle, 
  BookOpen,
  AlertTriangle,
  Lightbulb,
  Copy,
  Check
} from 'lucide-react'

interface ResolutionGuideProps {
  transaction: Transaction
  documentationLinks: DocumentationLink[]
}

export function ResolutionGuide({ transaction, documentationLinks }: ResolutionGuideProps) {
  const [copiedSteps, setCopiedSteps] = useState<Set<number>>(new Set())
  const [isGeneratingGuide, setIsGeneratingGuide] = useState(false)

  // AI-generated resolution steps based on error category
  const generateResolutionSteps = (errorCategory?: string, errorMessage?: string) => {
    switch (errorCategory) {
      case 'network':
        return [
          {
            id: '1',
            title: 'Netzwerkverbindung prüfen',
            description: 'Überprüfen Sie die Internetverbindung und DNS-Auflösung.',
            code: 'curl -I https://api.payment-provider.com/health'
          },
          {
            id: '2',
            title: 'Proxy-Einstellungen überprüfen',
            description: 'Stellen Sie sicher, dass Proxy-Einstellungen korrekt konfiguriert sind.',
            code: 'export https_proxy=http://proxy.company.com:8080'
          },
          {
            id: '3',
            title: 'Firewall-Regeln prüfen',
            description: 'Verifizieren Sie, dass ausgehende Verbindungen zur Payment-API erlaubt sind.'
          }
        ]
      
      case 'authentication':
        return [
          {
            id: '1',
            title: 'API-Schlüssel validieren',
            description: 'Überprüfen Sie, ob der verwendete API-Schlüssel noch gültig ist.',
            code: 'curl -H "Authorization: Bearer YOUR_API_KEY" https://api.payment-provider.com/auth/validate'
          },
          {
            id: '2',
            title: 'Token-Ablaufzeit prüfen',
            description: 'Stellen Sie sicher, dass das Access Token nicht abgelaufen ist.'
          },
          {
            id: '3',
            title: 'Berechtigungen überprüfen',
            description: 'Verifizieren Sie, dass der API-Schlüssel die erforderlichen Berechtigungen hat.'
          }
        ]
      
      case 'validation':
        return [
          {
            id: '1',
            title: 'Eingabedaten validieren',
            description: 'Überprüfen Sie alle erforderlichen Felder und Datenformate.',
            code: JSON.stringify({
              amount: "99.99",
              currency: "EUR",
              payment_method: "card",
              card_number: "4111111111111111"
            }, null, 2)
          },
          {
            id: '2',
            title: 'Schema-Validierung durchführen',
            description: 'Stellen Sie sicher, dass alle Daten dem erwarteten Schema entsprechen.'
          },
          {
            id: '3',
            title: 'Sonderzeichen prüfen',
            description: 'Entfernen Sie ungültige Sonderzeichen aus Eingabefeldern.'
          }
        ]
      
      case 'database':
        return [
          {
            id: '1',
            title: 'Datenbankverbindung testen',
            description: 'Überprüfen Sie die Verbindung zur Datenbank.',
            code: 'SELECT 1; -- Test connection'
          },
          {
            id: '2',
            title: 'Connection Pool prüfen',
            description: 'Stellen Sie sicher, dass der Connection Pool nicht erschöpft ist.'
          },
          {
            id: '3',
            title: 'Transaktions-Locks überprüfen',
            description: 'Suchen Sie nach blockierenden Transaktionen oder Deadlocks.'
          }
        ]
      
      case 'timeout':
        return [
          {
            id: '1',
            title: 'Timeout-Werte erhöhen',
            description: 'Passen Sie die Timeout-Konfiguration an.',
            code: 'request_timeout = 30000  # 30 seconds'
          },
          {
            id: '2',
            title: 'Retry-Mechanismus implementieren',
            description: 'Fügen Sie exponential backoff retry logic hinzu.'
          },
          {
            id: '3',
            title: 'Performance optimieren',
            description: 'Analysieren Sie langsame Abfragen und optimieren Sie diese.'
          }
        ]
      
      default:
        return [
          {
            id: '1',
            title: 'Logs analysieren',
            description: 'Überprüfen Sie die detaillierten Logs für weitere Hinweise.',
            code: 'tail -f /var/log/payment-service.log | grep ERROR'
          },
          {
            id: '2',
            title: 'System-Status prüfen',
            description: 'Verifizieren Sie den Status aller abhängigen Services.'
          },
          {
            id: '3',
            title: 'Support kontaktieren',
            description: 'Kontaktieren Sie den technischen Support mit der Transaktions-ID.'
          }
        ]
    }
  }

  const copyToClipboard = async (text: string, stepIndex: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSteps(prev => new Set(prev).add(stepIndex))
      setTimeout(() => {
        setCopiedSteps(prev => {
          const newSet = new Set(prev)
          newSet.delete(stepIndex)
          return newSet
        })
      }, 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const getDocumentationIcon = (type: string) => {
    switch (type) {
      case 'api':
        return <FileText className="w-4 h-4" />
      case 'guide':
        return <BookOpen className="w-4 h-4" />
      case 'troubleshooting':
        return <AlertTriangle className="w-4 h-4" />
      case 'faq':
        return <HelpCircle className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const resolutionSteps = generateResolutionSteps(transaction.errorCategory, transaction.errorMessage)
  const estimatedTime = '15-30 Minuten'
  const difficulty = 'medium'

  return (
    <div className="space-y-6">
      {/* AI Guide Header */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base text-blue-800 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI-generierte Lösungsanleitung
          </CardTitle>
          <CardDescription className="text-blue-700">
            Automatisch generierte Schritte zur Behebung dieses {transaction.errorCategory}-Fehlers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-700" />
              <span className="text-sm text-blue-800">Geschätzte Zeit: {estimatedTime}</span>
            </div>
                         <Badge variant="outline" className={getDifficultyColor(difficulty)}>
               Mittel
             </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Resolution Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Schritt-für-Schritt Anleitung
          </CardTitle>
          <CardDescription>
            Folgen Sie diesen Schritten in der angegebenen Reihenfolge
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {resolutionSteps.map((step, index) => (
            <div key={step.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{step.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                  
                  {step.code && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Code/Befehl
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(step.code!, index)}
                          className="h-6 px-2"
                        >
                          {copiedSteps.has(index) ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                        {step.code}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Documentation Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Weiterführende Dokumentation
          </CardTitle>
          <CardDescription>
            Zusätzliche Ressourcen zur Problemlösung
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {documentationLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {getDocumentationIcon(link.type)}
                <span className="text-sm font-medium flex-1">{link.title}</span>
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Context */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">Wichtige Hinweise</h4>
              <ul className="text-sm text-amber-700 mt-2 space-y-1">
                <li>• Testen Sie Änderungen zunächst in einer Staging-Umgebung</li>
                <li>• Dokumentieren Sie alle durchgeführten Schritte</li>
                <li>• Überwachen Sie die Logs während der Problemlösung</li>
                <li>• Kontaktieren Sie das Support-Team bei anhaltenden Problemen</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 