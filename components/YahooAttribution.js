import styles from '../styles/YahooAttribution.module.css'
import { withBasePath } from '../utils/basePath';

// Required by Yahoo Fantasy Sports API Terms of Use / Attribution Requirements.
// Do not alter the logo (no rotation, recoloring, stretching, shadows, or
// combining with other marks) and do not change the attribution text or link.
export default function YahooAttribution() {
    return (
        <a
            href="https://sports.yahoo.com/fantasy/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.attributionLink}
            aria-label="Fantasy data provided by Yahoo Fantasy"
        >
            <span className={styles.logoCrop}>
                <img
                    src={withBasePath("/Yahoo_Fantasy.svg")}
                    alt="Yahoo Fantasy"
                    className={styles.logo}
                />
            </span>
            <span className={styles.text}>Fantasy data provided by Yahoo Fantasy</span>
        </a>
    )
}
