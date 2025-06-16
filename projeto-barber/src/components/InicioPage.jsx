import React from "react";
import "./InicioPage.css";

export default function InicioPage() {
  return (
    <div className="inicio-root">
      <div>
        <div className="inicio-header">
          <h2 className="inicio-title">Selecione a Barbershop</h2>
        </div>

        <div className="inicio-grid">
          {/* Barber 1 */}
          <div className="inicio-barber-card">
            <div
              className="inicio-barber-image"
              style={{
                backgroundImage:
                  'url("/images/RBI IGUAÇU FOTO.webp")',
              }}
            ></div>
            <div>
              <button className="inicio-barber-name">RBI IGUAÇU</button>
              <p className="inicio-barber-desc">
                Rua Capivari, 354 - Iguaçu, Araucária - PR, 83701-440
              </p>
            </div>
          </div>

          {/* Barber 2 */}
          <div className="inicio-barber-card">
            <div
              className="inicio-barber-image"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBm4u-o2qN0aIFIldCodjVJ-SghLVtCTG6Px6vFSALdS1MB-M1-sZnrOEDYXLq0vBxRHn9dflgwx_tYMzdoNiCFGMXfsI_bDWGDPKVy-7jhbOmpa2xDfQlpBhinRibrQm0ob1WaBsOXXggM_3eQCheGRMTDIODDsHCb2zCZfaOvuHaZcHr5sjUv6iPgBCURL1BoymYD4Mc0GV4cX8kPDSstsW7FjxEdbXC0e6Rn7A961CS7N7qn2NGK3jzropEL3pwte3IRTcz24dY")',
              }}
            ></div>
            <div>
              <button className="inicio-barber-name">RBI IGUAÇU</button>
              <p className="inicio-barber-desc">
                Traditional cuts and shaves in a classic setting.
              </p>
            </div>
          </div>

          {/* Barber 3 */}
          <div className="inicio-barber-card">
            <div
              className="inicio-barber-image"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAo0mOzsXBXUlv19jOXqCJGfZdTG9Pkg9xnpHydctaywkLIe_NGcifhI74gJf_9zcWFtFQ6wHHT-UAFuYbbaTl1CAKS2Wagb-50jPfCjVlhbY2W-nFK599NbfiqwjkPiRjwdPM4k1IGniDgkP5_kHln3ey8J8JnZontTBGTyF6ZAMRS61nNFUeje8OxYuGgPPevkeFNmJnZOTGh2NX3WevZfBRhJ83MLE-6n9EuB_2a73zQs_bKFOdjmsSghFa_dxgzHM-vIujaPa0")',
              }}
            ></div>
            <div>
              <button className="inicio-barber-name">RBI IGUAÇU</button>
              <p className="inicio-barber-desc">
                A refined experience for the discerning gentleman.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="inicio-footer">
          <button className="inicio-btn-continue">
            <span className="inicio-btn-text">Continue</span>
          </button>
        </div>
        <div className="inicio-footer-spacer"></div>
      </div>
    </div>
  );
}
