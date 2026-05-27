"use client";
import { getLanguageFromPathname } from "@/app/lib/helper";
import { usePathname } from "next/navigation";

export default function PrivacyPolicy() {
  const pathname = usePathname();
  const language = getLanguageFromPathname(pathname);

  const sectionClassName = "flex flex-col gap-2";
  const smallHeaderClassName = "text-lg font-semibold mt-2 mt-2";
  const spanClassName = "text-[17px]";

  return (
    <div className="flex flex-col items-center pt-5 pb-3 sm:pt-7 xl:pt-8 2xl:pt-9">
      <h1 className="text-xl text-center font-bold">
        {language === "en" ? "Privacy Policy" : "プライバシーポリシー"}
      </h1>
      <div className="flex flex-col w-[90%] sm:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] my-5 leading-tight gap-3 bg-white rounded-lg p-4 sm:p-5 lg:p-6 2xl:p-7">
        {/* section 1 */}
        <div className={sectionClassName}>
          <h2 className={smallHeaderClassName}>
            1. {language === "en" ? "What We Collect" : "集めるデータ"}
          </h2>
          <p>
            {language === "en"
              ? "We collect and store the following data:"
              : "以下のデータを収集し保管します："}
          </p>
          <p>
            <span className={spanClassName}>
              • {language === "en" ? "User information" : "ユーザー情報"}
            </span>
            {language === "en"
              ? " - your email address and password (if you sign up with your Google account, password won't be stored) solely for authentication purposes"
              : " - メールアドレスとパスワード（Googleアカウントで登録の場合は、パスワードは保管されません）を認証の用途にのみ使用"}
          </p>
          <p>
            <span className={spanClassName}>
              • {language === "en" ? "Vocabulary data" : "単語のデータ"}
            </span>
            {language === "en"
              ? " - words and related learning data that you save within the app"
              : " - ユーザーがこのアプリ内で保存した単語とそれに関連するデータ"}
          </p>
          <p>
            <span className={spanClassName}>
              • {language === "en" ? "Journal data" : "ジャーナルのデータ"}
            </span>
            {language === "en"
              ? " - journals that you registered within the app and related data such as journal dates"
              : " - ユーザーが登録したジャーナルとそれに関連するジャーナル日等のデータ"}
          </p>
        </div>
        {/* section 2 */}
        <div className={sectionClassName}>
          <h2 className={smallHeaderClassName}>
            2.{" "}
            {language === "en"
              ? "Where Data is Stored"
              : "データが保管される場所"}
          </h2>
          <p className="mb-1">
            {language === "en"
              ? "Your data is stored in two places:"
              : "ユーザーのデータは二か所に保管されます："}
          </p>
          <p>
            <span className={spanClassName}>
              • {language === "en" ? "Your browser" : "ユーザーのブラウザー"}
            </span>
            {language === "en"
              ? " - via cookies, sessionStorage, localStorage, and IndexedDB for session management and local performance"
              : " - セッション管理とローカルパフォーマンスのため、クッキー、セッションストレージ、ローカルストレージ、IndexedDBに保管"}
          </p>
          <p>
            <span className={spanClassName}>
              • {language === "en" ? "Our servers" : "サーバー"}
            </span>
            {language === "en"
              ? " - your personal data, vocabulary data, and journal data are saved in a cloud database (MongoDB) to allow your data to persist across devices and sessions"
              : " - デバイス間、セッション間でユーザーのデータを一貫させるため、ユーザーの個人情報、単語データ、ジャーナルデータはクラウドデータベース（MongoDB）に保管"}
          </p>
        </div>
        {/* section 3 */}
        <div className={sectionClassName}>
          <h2 className={smallHeaderClassName}>
            3. {language === "en" ? "Purpose" : "目的"}
          </h2>
          <p>
            {language === "en"
              ? "All data stored in your browser is used solely to provide and improve your experience with the app. "
              : "ユーザーのブラウザーに保管されたデータは全て、このアプリのユーザーエクスペリエンスを向上させるためにのみ使用されます"}
          </p>
          <p>{language === "en" ? "Specifically:" : "特に："}</p>
          <p>
            <span className={spanClassName}>
              • {language === "en" ? "Session cookies" : "セッションクッキー"}
            </span>
            {language === "en"
              ? " keep you logged in during your visit"
              : "はユーザーがこのアプリを使用時に、ユーザーのログインを保つために使用"}
          </p>
          <p>
            <span className={spanClassName}>
              • {language === "en" ? "sessionStorage" : "セッションストレージ"}
            </span>
            {language === "en"
              ? " data is used to track in-session state and is deleted when you close the tab"
              : "データはセッション内の状態をトラッキングするために使用。またタブが閉じられる際に削除"}
          </p>
          <p>
            <span className={spanClassName}>
              • {language === "en" ? "localStorage" : "ローカルストレージ"}
            </span>
            {language === "en"
              ? " data helps us avoid showing you repeated instructions or prompts you have already seen"
              : "データはユーザーがすでに確認したインストラクションやプロンプトが再び出てくるのを防ぐために使用"}
          </p>
          <p>
            <span className={spanClassName}>• IndexedDB</span>
            {language === "en"
              ? " stores your vocabulary list and journals so it is available across sessions and offline"
              : "にはユーザーの単語リストとジャーナルを保管し、セッションにまたがる、またオフライン上での利用を可能にするために使用"}
          </p>
        </div>
        {/* section 4 */}
        <div className={sectionClassName}>
          <h2 className={smallHeaderClassName}>
            4. {language === "en" ? "Data Retention" : "保管される期間"}
          </h2>
          <p>
            <span className={spanClassName}>
              •{" "}
              {language === "en"
                ? "Session cookies / sessionStorage"
                : "セッションクッキー、セッションストレージ"}
            </span>
            {language === "en"
              ? " - cleared when your session ends or tab is closed"
              : " - ユーザーのセッションが終わる際、またはタブが閉じられる際に削除"}
          </p>
          <p>
            <span className={spanClassName}>
              •{" "}
              {language === "en"
                ? "localStorage / IndexedDB (browser)"
                : "ローカルストレージ、IndexedDB（ブラウザー）"}
            </span>
            {language === "en"
              ? " - retained until you clear your browser data"
              : " - ユーザーがブラウザーのデータを削除するまで保管"}
          </p>
          <p>
            <span className={spanClassName}>
              •{" "}
              {language === "en"
                ? "Server-side data (MongoDB)"
                : "サーバー側のデータ（MongoDB）"}
            </span>
            {/* "- Your personal data is retained as long as your account is active. (If you delete your account, your data will also be deleted.) Your vocabulary / journal data are retained until you delete the data within the app. You may request deletion of your data at any time by contacting us." */}
            {language === "en"
              ? " - Your personal data is retained as long as your account is active. Your vocabulary / journal data are retained until you delete the data within the app. If you delete your account, all of your data will be deleted."
              : " - ユーザーの個人情報はユーザーのアカウントがアクティブである間保管。ユーザーの単語、ジャーナルデータはユーザーがアプリ上で削除するまで保管。ユーザーがアカウントを閉じた場合、全てのユーザーのデータは削除。"}
          </p>
          <p>
            <span className={spanClassName}>• IndexedDB</span>
            {language === "en"
              ? " data is retained until you delete your vocabulary / journal data within the app or clear your browser's site data"
              : "データはユーザーが単語、ジャーナルデータをアプリ上で削除、またはブラウザーのサイトデータを削除するまで保管"}
          </p>
        </div>
        {/* section 5 */}
        <div className={sectionClassName}>
          <h2 className={smallHeaderClassName}>
            5. {language === "en" ? "Data Sharing" : "データ共有"}
          </h2>
          <p>
            {language === "en"
              ? "We do not sell or share your data with third parties. Your data is stored securely on our servers and is only used to provide the app's functionality. We do not use any of your data for advertising or analytics purposes."
              : "私たちはユーザーのデータを第三者に販売、共有をすることはありません。ユーザーのデータはサーバー上に安全に保管され、アプリの機能にのみ用います。また、私たちはユーザーのいかなるデータも広告や分析目的に使用しません。"}
          </p>
        </div>
        {/* section 6 */}
        <div className={sectionClassName}>
          <h2 className={smallHeaderClassName}>
            6. {language === "en" ? "Data Security" : "データセキュリティー"}
          </h2>
          <p>
            {language === "en"
              ? "We take reasonable measures to protect your data stored on our servers, including encrypted connections (HTTPS) and access controls. However, no method of transmission over the internet is 100% secure."
              : "私たちはサーバーに保管されたユーザーのデータを、暗号化されたコネクション（HTTPS）やアクセスコントロールなど合理的な対策によって保護します。しかしながら、インターネット上のどのような伝達も１００％の安全は保障できません。"}
          </p>
        </div>
        {/* sectio 7 */}
        <div className={sectionClassName}>
          <h2 className={smallHeaderClassName}>
            7. {language === "en" ? "User Control" : "ユーザーコントロール"}
          </h2>
          <p>{language === "en" ? "You can:" : "ユーザーは:"}</p>
          <p>
            •{" "}
            {language === "en"
              ? "Clear browser storage at any time through your browser settings"
              : "ユーザーのブラウザー設定からブラウザーのストレージをいつでも削除できます"}
            <br />•{" "}
            {language === "en"
              ? "Delete your vocabulary / journal data within the app"
              : "ユーザーの単語、ジャーナルデータをアプリ内で削除できます"}
            <br />•{" "}
            {language === "en"
              ? "Delete your personal data by deleting your account within the app"
              : "アプリ内でアカウントを閉じることによってユーザーの個人情報を削除できます"}
            <br />•{" "}
            {language === "en"
              ? "Log out to end your session"
              : "ログアウトをしてユーザーのセッションを終了するができます"}
            {/* <br />
            •{" "}
            {language === "en"
              ? "request deletion of your data on our servers at any time by contacting us at []."
              : ""} */}
          </p>
        </div>
      </div>
    </div>
  );
}
