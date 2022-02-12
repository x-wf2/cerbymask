import { useEffect, useState } from "react"
import "../../css/ChooseValidator.css"
import { ValidatorT } from "../../types"
import { getValidators } from "../../utils/background"
import { PuffLoader } from "react-spinners"

export function RevealSeedPhrase(props: any) {
    
    const [revealing, setRevealing] = useState(false)

    return (
        <div className="modal-form-container">
            <h1 className="normal-1">Reveal Seed Phrase</h1>
            { !revealing &&
                <span onClick={() => setRevealing(!revealing)} className="click-to-approve">Click to reveal</span>
            }
            { props.wallet.unlocked &&
                <p onClick={() => setRevealing(!revealing)} className={`seed-phrase-disclose ${revealing ? '' : 'blur-text'}`}>
                    { props.wallet.radixWallet.revealMnemonic().phrase }
                </p>
            }
        </div>
    )
}