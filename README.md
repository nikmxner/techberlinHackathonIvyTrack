# Analytics Dashboard

Eine moderne Analytics Dashboard Anwendung, die natürliche Sprache in SQL-Abfragen umwandelt und dynamische Datenvisualisierungen erstellt.

## 🚀 Features

### Kernfunktionen
- **Natürliche Sprache zu SQL**: Beschreiben Sie Ihre Datenanalyse in natürlicher Sprache
- **AI-gestützte Query-Generierung**: Automatische SQL-Generierung basierend auf Prompts
- **Dynamische Datenvisualisierung**: Automatische Chart-Generierung mit Recharts
- **Umfassende Prompt-Historie**: Vollständiges History-Management mit LocalStorage und Database-Sync

### History-System Features
- **Lokale und Cloud-Speicherung**: Sofortiger Zugriff via LocalStorage + Database-Synchronisation
- **Erweiterte Suchfunktionen**: Durchsuchen und Filtern der Prompt-Historie
- **Kategorisierung**: Automatische Gruppierung nach Datum (Heute, Gestern, Diese Woche, Älter)
- **Favoriten-System**: Markieren und schneller Zugriff auf häufig verwendete Prompts
- **Export/Import**: JSON-Export und -Import der kompletten Historie
- **Tags und Metadaten**: Vollständige Tracking von Ausführungszeit, Status und Chart-Typen

### UI/UX Features
- **Moderne Benutzeroberfläche**: Shadcn/ui Komponenten mit Tailwind CSS
- **Responsive Design**: Optimiert für Desktop und Mobile
- **Collapsible Sidebar**: Ausklappbare History-Sidebar
- **Real-time Updates**: Live-Updates der Historie und Statistiken
- **Error Handling**: Umfassende Fehlerbehandlung und User-Feedback

## 🛠 Tech Stack

- **Frontend**: Next.js 14+ mit App Router, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui
- **Charts**: Recharts für Datenvisualisierung
- **Database**: Prisma ORM mit SQLite
- **State Management**: React Hooks und LocalStorage
- **API**: Next.js API Routes

## 📁 Projektstruktur

```
src/
├── app/
│   ├── api/
│   │   ├── generate-query/route.ts    # AI SQL-Generierung
│   │   ├── execute-query/route.ts     # SQL-Ausführung
│   │   ├── history/route.ts           # History CRUD
│   │   └── history/[id]/route.ts      # Einzelne History Items
│   ├── layout.tsx                     # Hauptlayout
│   └── page.tsx                       # Dashboard-Seite
├── components/
│   ├── ui/                           # Shadcn/ui Komponenten
│   ├── PromptInput.tsx               # Prompt-Eingabe mit Auto-complete
│   ├── DynamicChart.tsx              # Dynamische Chart-Komponente
│   ├── Dashboard.tsx                 # Haupt-Dashboard
│   └── PromptHistory/
│       ├── HistorySidebar.tsx        # History Sidebar
│       ├── HistoryItem.tsx           # Einzelne History-Einträge
│       └── HistorySearch.tsx         # Such-Komponente
├── hooks/
│   ├── usePromptHistory.ts           # History Management Hook
│   └── useLocalStorage.ts            # LocalStorage Hook
├── lib/
│   ├── database.ts                   # Prisma Database Utils
│   └── utils.ts                      # Utility-Funktionen
└── types/
    └── index.ts                      # TypeScript Definitionen
```

## 🚀 Schnellstart

### Voraussetzungen
- Node.js 18+
- npm oder yarn

### Installation

1. **Dependencies installieren**
   ```bash
   npm install
   ```

2. **Datenbank einrichten**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Entwicklungsserver starten**
   ```bash
   npm run dev
   ```

4. **Dashboard öffnen**
   ```
   http://localhost:3000
   ```

## 📊 Verwendung

### Prompt-Eingabe
1. Geben Sie Ihre Datenanalyse in natürlicher Sprache ein
2. Nutzen Sie Schnellaktionen für häufige Anfragen
3. Verwenden Sie Auto-Complete für frühere Prompts

### Beispiel-Prompts
- "Zeige mir die Umsatzentwicklung der letzten 6 Monate"
- "Welche Produktkategorien haben die höchste Konversionsrate?"
- "Erstelle eine Analyse der Kundensegmente nach Regionen"

### History-Management
- **Suchen**: Durchsuchen Sie Ihre Prompt-Historie
- **Filtern**: Nach Status, Favoriten oder Datum filtern
- **Favoriten**: Wichtige Prompts markieren
- **Export**: Historie als JSON exportieren

### Chart-Typen
- **Line Charts**: Zeitreihen und Trends
- **Bar Charts**: Kategorische Vergleiche
- **Pie Charts**: Anteilsverteilungen
- **Area Charts**: Kumulative Darstellungen
- **Scatter Plots**: Korrelationsanalysen

## 🔧 Konfiguration

### Environment Variables
```bash
# .env
DATABASE_URL="file:./dev.db"
```

### Datenbankschema
```prisma
model PromptHistory {
  id            String   @id @default(cuid())
  prompt        String
  sqlQuery      String?
  timestamp     DateTime @default(now())
  executionTime Int?
  status        String
  resultCount   Int?
  chartTypes    String?
  isFavorite    Boolean  @default(false)
  tags          String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

## 🎨 Anpassungen

### Neue Chart-Typen hinzufügen
1. Chart-Type in `types/index.ts` erweitern
2. Render-Logic in `DynamicChart.tsx` hinzufügen
3. Suggestion-Logic in `generate-query/route.ts` erweitern

### AI-Integration
Ersetzen Sie die Mock-Implementierung in `generate-query/route.ts` mit:
- OpenAI GPT-4
- Anthropic Claude
- Google Gemini
- Lokales LLM

### Database-Provider
Ändern Sie in `prisma/schema.prisma`:
- PostgreSQL
- MySQL
- MongoDB

## 🚧 Roadmap

- [ ] **Erweiterte AI-Integration**: OpenAI/Claude Integration
- [ ] **Mehr Chart-Typen**: Heatmaps, Treemaps, etc.
- [ ] **Team-Features**: Shared Dashboards, Collaboration
- [ ] **Advanced Filters**: Erweiterte Filter-Optionen
- [ ] **Real-time Data**: WebSocket-Integration
- [ ] **Mobile App**: React Native Version

## 🤝 Beitragen

1. Fork das Repository
2. Erstellen Sie einen Feature-Branch
3. Implementieren Sie Ihre Changes
4. Testen Sie Ihre Änderungen
5. Erstellen Sie einen Pull Request

## 📝 Lizenz

MIT License - siehe [LICENSE](LICENSE) Datei für Details.

## 🆘 Support

- GitHub Issues für Bug Reports
- Discussions für Feature Requests
- Wiki für erweiterte Dokumentation

---

**Entwickelt mit ❤️ und modernen Web-Technologien**
