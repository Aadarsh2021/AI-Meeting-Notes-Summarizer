# 🤖 AI Meeting Notes Summarizer

> **AI-powered meeting notes summarizer and sharer with intelligent text processing, custom instructions, and email sharing capabilities.**

## ✨ Features

- 🧠 **AI-Powered Summarization**: Uses Groq API for intelligent text processing
- 📝 **Custom Instructions**: Specify summarization style (e.g., "for executives", "action items")
- ✏️ **Editable Summaries**: Modify generated summaries before sharing
- 📧 **Email Sharing**: Send summaries via Gmail SMTP
- 💾 **Database Storage**: Persistent storage for summaries and email logs
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🚀 **Real-time Processing**: Fast AI generation with loading states

## 🏗️ Tech Stack

### Frontend
- **React 18** + **TypeScript**
- **Tailwind CSS** for styling
- **React Hot Toast** for notifications
- **Lucide React** for icons

### Backend
- **Node.js** + **Express.js**
- **SQLite3** database
- **Nodemailer** for email
- **Groq SDK** for AI integration

### Deployment
- **Frontend**: Vercel
- **Backend**: Render.com
- **Database**: SQLite (persistent)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Groq API key
- Gmail app password

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Aadarsh2021/AI-Meeting-Notes-Summarizer.git
   cd AI-Meeting-Notes-Summarizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd client && npm install
   cd ..
   ```

3. **Set up environment variables**
   Create `.env` file in root directory:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password_here
   PORT=5000
   NODE_ENV=development
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```
   
   This starts both frontend (port 3000) and backend (port 5000)

5. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🌐 Deployment

### Step 1: Deploy Backend to Render.com

1. **Go to [Render.com](https://render.com)**
2. **Sign up with GitHub** (free account)
3. **Click "New +" → "Web Service"**
4. **Connect your GitHub repository**
5. **Configure service:**
   - **Name**: `ai-meeting-summarizer-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server/index.js`
6. **Set Environment Variables:**
   ```
   GROQ_API_KEY=your_groq_api_key_here
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password_here
   PORT=10000
   NODE_ENV=production
   ```
7. **Click "Create Web Service"**
8. **Wait for deployment** (5-10 minutes)
9. **Copy your backend URL** (e.g., `https://your-app.onrender.com`)

### Step 2: Deploy Frontend to Vercel

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "New Project"**
3. **Import your GitHub repository**
4. **Configure settings:**
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: `client/build`
   - **Install Command**: `npm install && cd client && npm install`
5. **Set Environment Variable:**
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   ```
6. **Click "Deploy"**
7. **Copy your frontend URL** (e.g., `https://your-app.vercel.app`)

### Step 3: Update Configuration

Update `vercel.json` with your actual Render backend URL:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/build/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://YOUR_ACTUAL_BACKEND_URL.onrender.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/client/build/$1"
    }
  ],
  "outputDirectory": "client/build"
}
```

## 🧪 Testing

### Sample Test Data
```
Meeting Transcript:
"Today we discussed the Q4 marketing strategy. The budget was approved at $75,000. 
We'll focus on social media campaigns and influencer partnerships. The team needs 
to be expanded by 2 people. Launch date is set for November 15th."

Custom Instruction:
"Create a summary with action items and key decisions for the marketing team"
```

### Expected Results
- ✅ AI generates structured summary
- ✅ Summary is saved to database
- ✅ Email sharing works
- ✅ All features responsive on mobile/desktop

## 📚 API Endpoints

### Backend API (Render.com)
- `GET /health` - Health check
- `POST /api/summarize` - Generate AI summary
- `POST /api/share` - Share summary via email
- `GET /api/summaries` - Get all summaries
- `POST /api/summaries` - Save summary
- `PUT /api/summaries/:id` - Update summary
- `DELETE /api/summaries/:id` - Delete summary

### Frontend Routes (Vercel)
- `/` - Main application
- `/api/*` - Proxied to backend

## 🔧 Environment Variables

### Backend (Render.com)
```env
GROQ_API_KEY=your_groq_api_key_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password_here
PORT=10000
NODE_ENV=production
```

### Frontend (Vercel)
```env
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

## 🆘 Troubleshooting

### Common Issues

**Backend Build Fails:**
- Check `package.json` has all dependencies
- Verify Node.js version compatibility

**API Connection Errors:**
- Verify backend URL in `vercel.json`
- Check `REACT_APP_API_URL` environment variable

**Email Sending Fails:**
- Verify Gmail app password
- Check email credentials in Render dashboard

**Port Binding Errors:**
- Ensure `PORT=10000` in Render environment variables

## 📁 Project Structure

```
ai-meeting-summarizer/
├── client/                 # React frontend
│   ├── build/             # Production build
│   ├── src/               # Source code
│   ├── public/            # Public assets
│   └── package.json       # Frontend dependencies
├── server/                 # Node.js backend
│   ├── routes/            # API route handlers
│   ├── index.js           # Main server file
│   └── database.js        # Database configuration
├── .env                    # Environment variables
├── .gitignore             # Git ignore rules
├── package.json           # Root dependencies
├── vercel.json            # Vercel configuration
└── README.md              # This file
```

## 🎯 Success Criteria

After deployment you should have:
- ✅ **Frontend URL**: `https://your-app-name.vercel.app`
- ✅ **Backend URL**: `https://your-app-name.onrender.com`
- ✅ **AI Summarization**: Working with Groq API
- ✅ **Email Sharing**: Working with Gmail SMTP
- ✅ **Database**: Storing summaries and email logs
- ✅ **All Features**: Fully functional and tested

## 🚀 Why This Stack?

### Render.com Backend
- ✅ **Free Tier Available** - No cost to get started
- ✅ **Node.js Native Support** - Perfect for Express servers
- ✅ **Persistent Storage** - SQLite database works great
- ✅ **Auto-restart** - App restarts if it crashes
- ✅ **Environment Variables** - Secure configuration
- ✅ **GitHub Integration** - Deploy directly from repo

### Vercel Frontend
- ✅ **Free Tier Available** - No cost to get started
- ✅ **React Native Support** - Perfect for React apps
- ✅ **Global CDN** - Fast worldwide access
- ✅ **Automatic Deployments** - Deploy on every push
- ✅ **Custom Domains** - Add your domain later

## 📈 Future Enhancements

- **User Authentication** - Login/signup system
- **Summary Templates** - Pre-built summarization templates
- **Export Formats** - PDF, Word, and Markdown export
- **Real-time Collaboration** - Multiple users editing summaries
- **Advanced AI Models** - Support for multiple AI providers
- **Analytics Dashboard** - Usage statistics and insights

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Groq API** for AI summarization capabilities
- **Gmail SMTP** for reliable email delivery
- **Render.com** for backend hosting
- **Vercel** for frontend hosting

---

## 🎉 Ready to Deploy!

**Your AI Meeting Notes Summarizer is production-ready!**

**Follow the deployment steps above and you'll have a working deployed link in 1-2 hours.**

**Need help?** Check the troubleshooting section or create an issue on GitHub.

---

*Built with ❤️ using React, Node.js, and AI*
