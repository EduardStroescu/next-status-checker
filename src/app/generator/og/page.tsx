import { Metadata } from "next";
import Playground from "./_components/og-generator";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/Spinner";
import "./styles.css";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "OG Generator",
  description: "Generate OG images for your projects using HTML.",
  openGraph: {
    title: "OG Generator",
    type: "website",
    url: `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL!}/generator/og`,
    description: "Generate OG images for your projects using HTML.",
    images: `https://${process.env
      .VERCEL_PROJECT_PRODUCTION_URL!}/api/og/fVJdb5swFP0ryFPeYkIDIW2kadq0tetD1Ze-TVXlwAXcGtuyLyFZxX_fNUnTD2WVEHCufe65H-eZFaYEtnpmuLP0ZaXcsCmzzlgfoh53ajyuhaXTPLNbNkwZ9gR6XnVKRc3-UynYji9eGBVJhNbzAjSCix47j7LavUCELfLzrYocKIFyA_tI3xCJtItGqtKBZqs_x6pkW7-ryhUUbBCtX81mHgV2JNZA8QSOmxZqEW_AFaBiYe1MWDkz9Uy2ogZOOba7b51TX0f6JP0-mV_SQwpx5QCsfIoL01IkIL6BAo0jJNYenSiQr4XWpLIWxVPtTKdL3kts-PEcjTW1E7bZ8RK8rPXDWZKd87N5ks7jR1tP0ksPLU7Sn0L6h2a3drKczPOeAsssoS57WWLDVkRIpqwBWTfIVnlK4MTUSdaoDiGS2gPywH-dn6YbwzA9TtFv3k3xIMTSJNA2EvofZks4iZJouYjyBUUrqRSFvlRVRejohla4WpIC3V0u9pZ4lT3qWUH53wiWFLtJl_HiIp4vVJrHF6SS_Y7zbA94nv090cDbFv5nz31BdyaYlKfzjyWx26voCmhvgrbJhuGecjJjURo95qmMRvohw2nRBp07J6SObnUw5EGEaeNaocKGDkvJwoZKgYJSjEUeyNfB5nTv5eiVsQyMD_neEG8EEaVQ0XURCjuVYdT8mOH-M9eUsO5qtqqE8jBl0JpHebcfJvYjCmum_n-1a6ANoetgGP4B`,
  },
  twitter: {
    card: "summary_large_image",
    title: "OG Generator",
    description: "Generate OG images for your projects using HTML.",
    images: `https://${process.env
      .VERCEL_PROJECT_PRODUCTION_URL!}/api/og/fVJdb5swFP0ryFPeYkIDIW2kadq0tetD1Ze-TVXlwAXcGtuyLyFZxX_fNUnTD2WVEHCufe65H-eZFaYEtnpmuLP0ZaXcsCmzzlgfoh53ajyuhaXTPLNbNkwZ9gR6XnVKRc3-UynYji9eGBVJhNbzAjSCix47j7LavUCELfLzrYocKIFyA_tI3xCJtItGqtKBZqs_x6pkW7-ryhUUbBCtX81mHgV2JNZA8QSOmxZqEW_AFaBiYe1MWDkz9Uy2ogZOOba7b51TX0f6JP0-mV_SQwpx5QCsfIoL01IkIL6BAo0jJNYenSiQr4XWpLIWxVPtTKdL3kts-PEcjTW1E7bZ8RK8rPXDWZKd87N5ks7jR1tP0ksPLU7Sn0L6h2a3drKczPOeAsssoS57WWLDVkRIpqwBWTfIVnlK4MTUSdaoDiGS2gPywH-dn6YbwzA9TtFv3k3xIMTSJNA2EvofZks4iZJouYjyBUUrqRSFvlRVRejohla4WpIC3V0u9pZ4lT3qWUH53wiWFLtJl_HiIp4vVJrHF6SS_Y7zbA94nv090cDbFv5nz31BdyaYlKfzjyWx26voCmhvgrbJhuGecjJjURo95qmMRvohw2nRBp07J6SObnUw5EGEaeNaocKGDkvJwoZKgYJSjEUeyNfB5nTv5eiVsQyMD_neEG8EEaVQ0XURCjuVYdT8mOH-M9eUsO5qtqqE8jBl0JpHebcfJvYjCmum_n-1a6ANoetgGP4B`,
  },
};

export default async function OGGeneratorPage() {
  const user = await getCurrentUser();
  return (
    <Suspense
      fallback={
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Spinner fontSize={2}>{`Loading • Loading • Loading • `}</Spinner>
        </div>
      }
    >
      <Playground isProUser={!!user} />
    </Suspense>
  );
}
