"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/dashboard");
      } else {
        setError(data.error || "Login gagal");
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="login">
        <div>
          <a className="hiddenanchor" id="signup"></a>
          <a className="hiddenanchor" id="signin"></a>

          <div className="login_wrapper">
            <div className="animate form login_form">
              <section className="login_content">
                <form onSubmit={handleSubmit}>
                  <h1>Login</h1>
                  {error && <p style={{ color: "red" }}>{error}</p>}
                  {!error && <p style={{ color: "red" }}></p>}
                  <div>
                    <input
                      name="username"
                      type="text"
                      className="form-control"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <input
                      name="password"
                      type="password"
                      className="form-control"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <button type="submit" disabled={loading} className="btn btn-default submit">
                      {loading ? "Memproses..." : "Masuk"}
                    </button>
                  </div>

                  <div className="clearfix"></div>

                  <div className="separator">
                    <div className="clearfix"></div>
                    <br />
                    <div>
                      <h1>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/api/logo"
                          width="auto"
                          height="35"
                          alt="logo"
                          style={{ height: "35px", width: "auto" }}
                        />{" "}
                        Jaya Prima
                      </h1>
                      <p>&copy;2026 All Rights Reserved.</p>
                    </div>
                  </div>
                </form>
              </section>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        body {
          background: #f7f7f7;
        }
      `}</style>
      <style jsx>{`
        /* ---- Base ---- */
        .login {
          background: #f7f7f7;
          min-height: 100vh;
          font-family: "Helvetica Neue", Roboto, Arial, "Droid Sans", sans-serif;
          font-size: 13px;
          color: #73879c;
        }

        /* ---- Hidden anchors ---- */
        a.hiddenanchor {
          display: none;
        }

        /* ---- Wrapper ---- */
        .login_wrapper {
          right: 0;
          margin: 5% auto 0;
          max-width: 350px;
          position: relative;
        }

        /* ---- Animate ---- */
        .animate {
          animation-duration: 0.5s;
          animation-timing-function: ease;
          animation-fill-mode: both;
          animation-name: fadeInLeft;
        }

        @keyframes fadeInLeft {
          0% {
            opacity: 0;
            transform: translateX(-20px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* ---- Form positions ---- */
        .login_form {
          position: absolute;
          top: 0;
          width: 100%;
          z-index: 22;
        }

        /* ---- Login content ---- */
        .login_content {
          margin: 0 auto;
          padding: 25px 0 0;
          position: relative;
          text-align: center;
          text-shadow: 0 1px 0 #fff;
          min-width: 280px;
        }

        .login_content h1 {
          font:
            400 25px Helvetica,
            Arial,
            sans-serif;
          letter-spacing: -0.05em;
          line-height: 20px;
          margin: 10px 0 30px;
          position: relative;
        }

        .login_content h1::before,
        .login_content h1::after {
          content: "";
          height: 1px;
          position: absolute;
          top: 10px;
          width: 20%;
        }

        .login_content h1::before {
          background: #7e7e7e;
          background: linear-gradient(to right, #fff 0%, #7e7e7e 100%);
          left: 0;
        }

        .login_content h1::after {
          background: #7e7e7e;
          background: linear-gradient(to left, #fff 0%, #7e7e7e 100%);
          right: 0;
        }

        /* ---- Form ---- */
        .login_content form {
          margin: 20px 0;
          position: relative;
        }

        /* ---- Form control (Bootstrap 3 match) ---- */
        .form-control {
          display: block;
          width: 100%;
          height: 34px;
          padding: 6px 12px;
          font-size: 14px;
          line-height: 1.42857;
          color: #555;
          background-color: #fff;
          background-image: none;
          border: 1px solid #ccc;
          border-radius: 0;
          box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
          transition:
            border-color ease-in-out 0.15s,
            box-shadow ease-in-out 0.15s;
          box-sizing: border-box;
          outline: none;
        }

        .form-control:focus {
          border-color: #ccd0d7;
          box-shadow: none !important;
          outline: 0;
        }

        /* ---- Login content form inputs (override) ---- */
        .login_content form input[type="text"],
        .login_content form input[type="password"] {
          border-radius: 3px;
          box-shadow:
            0 1px 0 #fff,
            0 -2px 5px rgba(0, 0, 0, 0.08) inset;
          border: 1px solid #c8c8c8;
          color: #777;
          margin: 0 0 20px;
          width: 100%;
        }

        .login_content form input[type="text"]:focus,
        .login_content form input[type="password"]:focus {
          box-shadow: 0 0 2px #a97aad inset;
          background-color: #fff;
          border: 1px solid #a878af;
          outline: 0;
        }

        /* ---- Button (Bootstrap 3 btn-default match) ---- */
        .btn {
          display: inline-block;
          padding: 6px 12px;
          margin-bottom: 0;
          font-size: 14px;
          font-weight: 400;
          line-height: 1.42857;
          text-align: center;
          white-space: nowrap;
          vertical-align: middle;
          cursor: pointer;
          user-select: none;
          background-image: none;
          border: 1px solid transparent;
          border-radius: 3px;
        }

        .btn-default {
          color: #333;
          background-color: #fff;
          border-color: #ccc;
        }

        .btn-default:hover {
          color: #333;
          background-color: #e6e6e6;
          border-color: #adadad;
          text-decoration: none;
        }

        .btn.submit {
          margin-top: 5px;
        }

        .btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        /* ---- Clearfix ---- */
        .clearfix {
          clear: both;
        }

        /* ---- Separator ---- */
        .separator {
          border-top: 1px solid #d8d8d8;
          margin-top: 10px;
          padding-top: 10px;
        }

        .separator p {
          color: #888;
          font-size: 13px;
          margin: 5px 0 0;
        }

        .separator h1 {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
      `}</style>
    </>
  );
}
