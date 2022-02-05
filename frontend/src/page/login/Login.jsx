import {useContext} from "../../context";
import {useState} from "react";
import {convertToX509} from "../../caUtil";
import {useLocalStorage} from "../../localStorage";
import {useNavigate} from "react-router-dom"

export const Login = () => {
    const { bankCA, usersCA, shopsCA, bankGateway, usersGateway, shopsGateway, bankWallet, usersWallet, shopsWallet } = useContext()
    const [state, setState] = useState({
        "username": "",
        "password": "",
        "secret": ""
    })
    const [userData, setUserData] = useLocalStorage("user", { mspid: "", username: "" })
    const navigate = useNavigate()

    const onSubmit = async (e) => {
        e.preventDefault()
        const { username, password, secret } = state
        try {
            const contract = await bankGateway.getNetwork("wsr").then(n => n.getContract("shop-manager"))
            const userOrgMSP = await contract.evaluateTransaction("GetUserOrgMSP", username)
            let user;
            try {
                const enrollReq = { enrollmentID: username, enrollmentSecret: password }

                switch(userOrgMSP) {
                    case "BankMSP":
                        user = await bankCA.enroll(enrollReq)
                        await bankWallet.put(username, convertToX509(user, userOrgMSP))
                        break;
                    case "UsersMSP":
                        user = await usersCA.enroll(enrollReq)
                        await usersWallet.put(username, convertToX509(user, userOrgMSP))
                        break;
                    case "ShopsMSP":
                        user = await shopsCA.enroll(enrollReq)
                        await shopsWallet.put(username, convertToX509(user, userOrgMSP))
                        break;
                    default:
                        throw new Error("User not found");
                }

                setUserData({ mspid: userOrgMSP, username })
                navigate("/")
            } catch(e) {
                console.error(e)
                alert("Error: " + e.text)
            }

        } catch(e) {
            console.error(e)
            return alert("Error: " + e.text)
        }
    }

    const onChange = (e) => {
        setState({...state, [e.target.name]: e.target.value})
    }

    return <>
        <h2>Log In</h2>
        <form onSubmit={onSubmit}>
            <label>
                Username:
                <input onChange={onChange} value={state.username} type={"text"} name={"username"}/>
                <br/>
                Password:
                <input onChange={onChange} value={state.password} type={"text"} name={"password"}/>
                <br/>
                Secret:
                <input onChange={onChange} value={state.secret} type={"text"} name={"secret"}/>
                <br/>
            </label>
            <input type={"submit"} value={"Log In"}/>
        </form>
    </>
}