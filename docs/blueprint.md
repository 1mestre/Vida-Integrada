# **App Name**: Vida Integrada

## Core Features:

- Tabbed Navigation: Tabbed interface for Calendario, Ingresos, Universidad, and Productividad, providing easy access to different aspects of life organization.
- Progress Visualization: Display progress bars for monthly income goals and time elapsed in the current month and year.
- Data Synchronization: Synchronization with Firebase Firestore to persist and share data across devices in real-time.
- Event Management: Shared event modal for creating and editing calendar and timetable events, ensuring consistency across different tabs.
- Pomodoro Timer: A Pomodoro timer with customizable work/break durations to help you be more efficient at focusing. Play/Pause and Reset are implemented.
- Ambiance Sounds: Ambiance player for focus with noise types such as Binaural beats and nature sounds.

## Style Guidelines:

- Background: Primary color: Dark Gray (Backgrounds Grouped.Dark - Base.Primary) #000000; to create a dark, calming background. Also background animations with emoji related to goal achievement.
- Primary Accent Color:  (Accents.Dark.8 Blue) #0091FF, to suggest intelligence and creativity in an aesthetic dark UI.
- Secondary accent color (Labels.Dark.2 Secondary): #EBEBF599 for labels
- Typography for large titles, ( 01 LargeTitle.2 Bold) color: #000000 text: {fontFamily: 'SF Pro', fontSize: '34px', fontWeight: 700, letterSpacing: '0px', lineHeight: 1.2058823529411764}. Note: currently only Google Fonts are supported.
- Headline text and titles : 'SF Pro', san-serif. For clear, readable headings and labels.( 05 Headline.1 Default) color: #000000 text: {fontFamily: 'SF Pro', fontSize: '17px', fontWeight: 600, letterSpacing: '0px', lineHeight: 1.2941176470588236}.
- Body text: 'SF Pro', sans-serif (06 Body.1 Default) color: #000000 text: {fontFamily: 'SF Pro', fontSize: '17px', fontWeight: 400, letterSpacing: '0px', lineHeight: 1.2941176470588236}.
- Use simple and clean icons to represent different categories and actions within the application.
- Liquid Glass: Use a frosted glass effect on widgets.  Dark - Sidebars and Sheets :fills:[ {color: #FFFFFF0B}, {color: #1E1E1E3F}, {color: #1C1C1EB3}], shadows: [{blur: 80px, color: #00000033, offsetX: 0px, offsetY: 4px, spread: 0px},{blur: 0.15px, color: #FFFFFF0C, offsetX: -0.25px, offsetY: -0.5px, spread: 0.5px},{blur: 0.5px, color: #FFFFFF38, offsetX: 0.25px, offsetY: 0.5px, spread: 0.25px}]
- Use dark mode aesthetics from the list with shadow/fills, like those used in: Sidebars and Sheets/Dark, Tab Bar - Selection/Dark, Tab Bar and Toolbar/Over Dark
- Subtle animations: Fade-in for tab content, pop-in for modals, shimmer for progress bars, and a background animation of floating emojis (💰, 🎓, 📅, ✨, 🚀, 🏆, 📈, 🎯, 💡, 📚).