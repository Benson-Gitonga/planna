
import 'bootswatch/dist/flatly/bootstrap.min.css';
import './global.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import Footer from './components/Footer';


export default function PublicLayout({ children }) {
  return (
    <html lang="en">
      <head>
        
      </head>
      <body>
        
        {children}
        <Footer />
       
      </body>
    </html>
  );
}

