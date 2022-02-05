import {Link} from "react-router-dom";

export const Home = () => {
    return (
        <>
            <h1>Shop Manager - HyperLedger</h1>
            <nav>
                <ul>
                    <li>
                        <Link to="/login">Log In</Link>
                    </li>
                    <li>
                        <Link to="/signup">Sign Up</Link>
                    </li>
                </ul>
            </nav>
        </>
    )
}