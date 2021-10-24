import defs from "../../../../package.json"

export default function Footer() {
    return (
        <div className="footer">
            <div className="centered-flex">
                <p className="small no-margin gray-text-3">CerbyMask {defs.version}</p>
                <p className="small no-margin gray-text-3">Get Support</p>
            </div>
        </div>
    )
}