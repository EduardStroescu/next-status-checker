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
      .VERCEL_PROJECT_PRODUCTION_URL!}/api/og/rVRbb9MwFP4rVVAlkJrUubeVEAK2wR5gEvQNIeQ4J4k3JzaO07SM8ts5brusHePygNSqPd85Prfvs28dJnNwFreO2Sj8dXK-ciaO0lK1Fm3NRuzcFfCyMhjgEzLGiJ7npro3c94qQTcIFALWCNifM66BGS4bhJkUXd2ggwpeNpcGaszvMGgMaESvu9bwYvNaot3YMoOnQOgj_4ZNzGcTm0ZqdPcVN-BsEai4yDVgiU_DDLwuT2bQDMHKGNUuptPWUNO1LquA3YB2ZQ0l9VagGQiPKjWlik9lOeU1LcHFHOvNi06L57vj4_DlOLjAD1bwCg2g-I3HZI2ItdwVjis1WjRrjabMuBltGqySUXZTatk1udtzU7mD30glS01VtXFzaHEzX3wSzVw_IGHgXatyHF6YcXjWmnEQh2d-GodJFKTh7Aes1RGUhAhVNWU7LImLOM5nkCYpxCSYz_2YJZnPgoikBAI2C4gfU59GjKZ-DkUcElZk0SwMC0aiFJMkPRbFJgjucZCAki0_sIn9I5_IwMTBCZwFmTgCCuQN_zxQxkPhFFxYYhdOJjr9NFbrZ6c0Np0Q2-1kILNdnZL5f7uRijJuULfEIzH2seLQv5JrDCAjMsIF2C_GrWvRWMFaGaCI-r73-tCTupyin0z3TT6mxcO4RxPwHOFG8hYu7nz3B-_PwbLTWSegYXau4fSd26qHivc2Dbozitk0fO0w3F7CCLGmq68wZgW272BHJDesWnKxQ_bWSfH96o-Xb-_vcfV_5RZvzNMnRzM-e6TO5z-wfFcnmM0RPiUljUdJvC8mEHpSFMWxSmuqS25VYSPV-lRcQz1FMf9RQcvJuzD14rkXxCJMvDlWid56SbQ33CT69pdd_e7l3De0tMKMyEk3ztWb72_O359_eLm8-uDsN4KKtKrepbBPH_5BMTW0tiWWmvJmdNVYyg_5UUm6psK-yAcyIoJVhiOXh2f0zpsSvBQPzh6Fv6MYzqkYXTLbxEnWX899Hu6XfSvu9ZCEaOSQdaWzKKhoYeJALa_5cr8p0--sw-N-XmeA6ze6g-32Jw.png`,
  },
  twitter: {
    card: "summary_large_image",
    title: "OG Generator",
    description: "Generate OG images for your projects using HTML.",
    images: `https://${process.env
      .VERCEL_PROJECT_PRODUCTION_URL!}/api/og/rVRbb9MwFP4rVVAlkJrUubeVEAK2wR5gEvQNIeQ4J4k3JzaO07SM8ts5brusHePygNSqPd85Prfvs28dJnNwFreO2Sj8dXK-ciaO0lK1Fm3NRuzcFfCyMhjgEzLGiJ7npro3c94qQTcIFALWCNifM66BGS4bhJkUXd2ggwpeNpcGaszvMGgMaESvu9bwYvNaot3YMoOnQOgj_4ZNzGcTm0ZqdPcVN-BsEai4yDVgiU_DDLwuT2bQDMHKGNUuptPWUNO1LquA3YB2ZQ0l9VagGQiPKjWlik9lOeU1LcHFHOvNi06L57vj4_DlOLjAD1bwCg2g-I3HZI2ItdwVjis1WjRrjabMuBltGqySUXZTatk1udtzU7mD30glS01VtXFzaHEzX3wSzVw_IGHgXatyHF6YcXjWmnEQh2d-GodJFKTh7Aes1RGUhAhVNWU7LImLOM5nkCYpxCSYz_2YJZnPgoikBAI2C4gfU59GjKZ-DkUcElZk0SwMC0aiFJMkPRbFJgjucZCAki0_sIn9I5_IwMTBCZwFmTgCCuQN_zxQxkPhFFxYYhdOJjr9NFbrZ6c0Np0Q2-1kILNdnZL5f7uRijJuULfEIzH2seLQv5JrDCAjMsIF2C_GrWvRWMFaGaCI-r73-tCTupyin0z3TT6mxcO4RxPwHOFG8hYu7nz3B-_PwbLTWSegYXau4fSd26qHivc2Dbozitk0fO0w3F7CCLGmq68wZgW272BHJDesWnKxQ_bWSfH96o-Xb-_vcfV_5RZvzNMnRzM-e6TO5z-wfFcnmM0RPiUljUdJvC8mEHpSFMWxSmuqS25VYSPV-lRcQz1FMf9RQcvJuzD14rkXxCJMvDlWid56SbQ33CT69pdd_e7l3De0tMKMyEk3ztWb72_O359_eLm8-uDsN4KKtKrepbBPH_5BMTW0tiWWmvJmdNVYyg_5UUm6psK-yAcyIoJVhiOXh2f0zpsSvBQPzh6Fv6MYzqkYXTLbxEnWX899Hu6XfSvu9ZCEaOSQdaWzKKhoYeJALa_5cr8p0--sw-N-XmeA6ze6g-32Jw.png`,
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
