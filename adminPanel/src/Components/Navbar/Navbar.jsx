import './Navbar_.css'
import navlogo from '../../assets/nav-logoc.png'
import navProfile from '../../assets/nav-profile.png'

const Navbar = () => {
  return (
    <div className='navbar'>
      <img src={navlogo} alt="" className='nav-logo'/>
      <p className='logo-text'>ADMINISTRATOR</p>
      <img src={navProfile} alt="" className="nav-profile" />
    </div>
  )
}

export default Navbar
