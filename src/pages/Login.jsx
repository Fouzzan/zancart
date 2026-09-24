import { SignIn } from "@clerk/react";
import Image from "../assets/Login/login.png";

function Login() {
  return (
    <main className="min-h-[calc(100vh-108px)] bg-[#f7f6f2] px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] lg:grid-cols-2">
        {/* LEFT — BRANDING */}
        <div className="relative hidden min-h-[650px] overflow-hidden bg-[#e9e4da] lg:block">
          {/* Background image */}
          <img
            src={Image}
            alt="ZANCART shopping"
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/25" />

          {/* Content */}
          <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
            <div>
              {/* <p className="text-sm font-medium uppercase tracking-[0.3em]">
                ZANCART
              </p> */}
            </div>

            <div className="max-w-md">
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em]">
                Welcome back
              </p>

              <h1 className="text-4xl font-semibold leading-tight xl:text-5xl">
                Everything you want,
                <br />
                all in one place.
              </h1>

              <p className="mt-5 max-w-sm text-sm leading-6 text-white/80">
                Discover products you'll love and enjoy a simpler way to shop.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT — CLERK */}
        <div className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
          <SignIn
            appearance={{
              variables: {
                colorPrimary: "#111111",
                colorText: "#111111",
                colorTextSecondary: "#737373",
                colorBackground: "#ffffff",
                colorInputBackground: "#ffffff",
                colorInputText: "#111111",
                borderRadius: "0.75rem",
                fontFamily: "Inter, sans-serif",
              },

              elements: {
                rootBox: "w-full",
                cardBox: "w-full shadow-none",
                card: "w-full max-w-md shadow-none border-0 p-0",

                headerTitle: "text-2xl font-semibold tracking-tight text-black",

                headerSubtitle: "text-sm text-neutral-500",

                socialButtonsBlockButton:
                  "h-11 border border-neutral-200 bg-white text-black hover:bg-neutral-50 transition",

                socialButtonsBlockButtonText: "font-medium text-sm",

                formFieldLabel: "text-sm font-medium text-neutral-800",

                formFieldInput:
                  "h-11 rounded-xl border-neutral-300 bg-white text-sm shadow-none focus:border-black focus:ring-1 focus:ring-black",

                formButtonPrimary:
                  "h-11 rounded-xl bg-black text-sm font-medium text-white shadow-none hover:bg-neutral-800 transition",

                footerActionLink: "font-medium text-black hover:underline",

                footerActionText: "text-sm text-neutral-500",

                identityPreviewEditButton: "text-black",

                dividerLine: "bg-neutral-200",

                dividerText: "text-neutral-400 text-sm",
              },
            }}
          />
        </div>
      </div>
    </main>
  );
}

export default Login;
