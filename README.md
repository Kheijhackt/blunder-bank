# Blunder Bank

A chess learning platform built with **Laravel** and **React** that helps players improve by studying their own mistakes through spaced repetition flashcards.

## 🎯 About

Blunder Bank is a personal chess improvement tool designed for players who want to systematically analyze and learn from their blunders. Rather than relying on engine analysis or automated imports, Blunder Bank puts **you** in control—you define what made the move a blunder, categorize it, and practice it until it sticks.

The core philosophy: **Manual Entry = Deeper Learning.** By forcing yourself to admit and analyze your errors, you create a more meaningful learning experience.

---

## ✨ Key Features

### 📚 Create Your Personal Blunder Library

- Add chess blunders from your games manually
- Store the chess position (FEN format), correct move, and opening details
- Add personal notes explaining why it was a blunder (tactical blindspot? Time pressure? Opening trap?)
- Track ELO rating at the time of the blunder
- Link to source games

### 🎮 Practice Modes

- **General Practice**: Review all blunders or filter by specific criteria
- **Focused Practice**: Targeted training sessions for specific blunders
- Answer interface for interactive learning

### 📊 Advanced Tracking & Statistics

- Overall accuracy percentage across all cards
- Correct vs. wrong attempts tracking
- Practice streaks (current and highest streak)
- Last practiced timestamp
- Filter blunders by:
    - Accuracy percentage
    - User ELO rating
    - Date created
    - Date last practiced
    - Opening name
    - Search by notes

### 🔐 Secure Authentication

- Email verification
- Two-factor authentication (2FA) support
- Secure password hashing
- Session management

### 📱 Modern User Experience

- Clean, responsive React interface with Inertia.js
- Real-time data updates
- Tailwind CSS styling with Radix UI components
- Dark mode support
- Mobile-friendly design

---

## 🛠️ Tech Stack

### Backend

- **Framework**: Laravel 12
- **Authentication**: Laravel Fortify (with 2FA support)
- **Database**: MySQL/PostgreSQL (migrations included)
- **API**: RESTful endpoints for flashcard CRUD operations
- **Testing**: Pest PHP
- **Code Quality**: Pint (PHP linter)

### Frontend

- **Library**: React 19
- **Routing**: Inertia.js (server-side routing with React components)
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI
- **Build Tool**: Vite
- **Type Safety**: TypeScript
- **Code Quality**: ESLint, Prettier

### DevOps & Tools

- **Package Manager**: Composer (PHP), npm (JavaScript)
- **Local Development**: Laravel Sail (Docker)
- **Queue Support**: Laravel Queue (for background tasks)

---

## 📁 Project Structure

```
blunder-bank/
├── app/
│   ├── Models/
│   │   ├── User.php              # User model with stats
│   │   └── FlashCard.php         # FlashCard model
│   ├── Http/
│   │   ├── Controllers/          # FlashCardController, UserController
│   │   ├── Middleware/           # Auth middleware
│   │   └── Requests/             # Form request validation
│   ├── Actions/
│   └── Concerns/                 # Traits for reusable logic
│
├── resources/
│   ├── js/
│   │   ├── pages/               # React page components
│   │   │   ├── dashboard.tsx    # Dashboard with stats
│   │   │   ├── blundersList.tsx # Library view with filters
│   │   │   ├── practiceFlashCards.tsx
│   │   │   ├── focusedPracticeFlashCards.tsx
│   │   │   └── welcome.tsx      # Landing page
│   │   └── components/          # Reusable React components
│   ├── css/                     # Tailwind configuration
│   └── views/
│       └── app.blade.php        # Root Blade template
│
├── routes/
│   └── web.php                  # All application routes
│
├── database/
│   ├── migrations/              # Database schema
│   ├── factories/               # Seeding factories
│   └── seeders/                 # Database seeders
│
├── tests/                       # Pest PHP tests
├── config/                      # Laravel configuration
├── bootstrap/                   # Bootstrap files
│
└── vite.config.ts              # Vite build configuration
```

---

## 🚀 Getting Started

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+ & npm
- MySQL/PostgreSQL database

### Installation

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd blunder-bank
    ```

2. **Run setup script** (Recommended)

    ```bash
    composer run setup
    ```

    This will:
    - Install PHP dependencies
    - Create `.env` file
    - Generate app key
    - Run database migrations
    - Install npm packages
    - Build assets

3. **Manual setup** (If needed)

    ```bash
    # Install dependencies
    composer install
    npm install

    # Environment configuration
    cp .env.example .env
    php artisan key:generate

    # Database setup
    php artisan migrate

    # Build frontend assets
    npm run build
    ```

### Development

Start the development server with all required services:

```bash
composer run dev
```

This runs concurrently:

- Laravel development server (port 8000)
- Queue listener
- Vite dev server (HMR)

For SSR (Server-Side Rendering):

```bash
composer run dev:ssr
```

### Building for Production

```bash
npm run build
php artisan queue:work
```

---

## 📋 Database Schema

### Users Table

- `id`, `name`, `email`, `password`
- `email_verified_at`, `two_factor_secret`, `two_factor_recovery_codes`
- **Statistics**: `stats_total_correct`, `stats_total_wrong`, `stats_last_practiced_at`, `stats_current_streak`, `stats_highest_streak`

### Flash Cards Table

- `id`, `user_id` (foreign key)
- `fen` (chess position)
- `correct_move` (correct response)
- `note` (long text explanation)
- `user_elo_at_time` (ELO rating when added)
- `opening_name` (e.g., "Sicilian Defense")
- `source_game_url` (link to game source)
- **Statistics**: `times_correct`, `times_wrong`, `last_practiced_at`, `priority_score`
- Timestamps: `created_at`, `updated_at`

---

## 🔌 API Endpoints

All authenticated endpoints require session or token authentication.

### Flashcard Operations

- `POST /api/flashcards` — Create new flashcard
- `GET /api/flashcards` — List all user's flashcards
- `GET /api/flashcards/:id` — Get specific flashcard
- `PATCH /api/flashcards/:id` — Update flashcard
- `DELETE /api/flashcards/:id` — Delete flashcard
- `GET /api/flashcards/next-card` — Get next card for practice
- `POST /api/flashcards/answer-attempt/:id` — Record practice attempt

### User Stats

- `GET /api/dashboard/stats` — Get user statistics

---

## 🧪 Testing

Run tests with:

```bash
composer test      # Run all tests with linting checks
npm run lint:check # Check JavaScript linting
npm run types:check # Check TypeScript types
```

---

## 🔄 Roadmap & Future Features

From `todo.tasks`:

- ✅ Accept multiple correct moves per card
- ⏳ Improve focused practice accuracy logic
- ⏳ Add Privacy Policy screen in footer
- ⏳ Implement platform logo
- ⏳ Add meta tags for better social sharing
- **Major**: Migrate endpoints to API-first with token authentication (for mobile app compatibility)

---

## 📝 Key Concepts

### FEN (Forsyth–Edwards Notation)

Chess positions are stored in FEN format—a standardized way to describe any chess position. Example:

```
r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4
```

### Spaced Repetition

The platform is designed with spaced repetition principles in mind—cards you struggle with are revisited more frequently, helping you solidify weak areas.

### Priority Score

Internal system to determine which cards need practice based on accuracy and recency.

---

## 🤝 Contributing

Contributions welcome! Please ensure:

1. Code follows Pint (PHP) and ESLint/Prettier (JavaScript) standards
2. Tests pass: `composer test`
3. Type checks pass: `npm run types:check`

---

## 📄 License

MIT License

---

## 👤 Author

Made by **Kian Jacob Anthony Tubalinal**

---

## 📧 Support

For issues or questions, please open an issue on the repository.

---

## 🎓 Learning Resources

- [Laravel Documentation](https://laravel.com/docs)
- [Inertia.js Documentation](https://inertiajs.com)
- [React Documentation](https://react.dev)
- [Chess FEN Format](https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation)
- [Spaced Repetition Learning](https://en.wikipedia.org/wiki/Spaced_repetition)

---

**Happy studying! Turn those blunders into strength.** ♟️
