import HeaderStyle from './Header.module.css';

export default function Header(){
    return (
        <header>
            <div className={HeaderStyle.header}>
                <img src='src/assets/pics/landingPage-pics/logo.png' alt='header' className={HeaderStyle.logo} />
                <div className={HeaderStyle.LogInSignUpContainer}>
                    <button className={HeaderStyle.button}>Login</button>
                    <button className={HeaderStyle.button}>Sign Up</button>
                </div>
            </div>
        </header>
    );
}