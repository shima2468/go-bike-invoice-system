import path from "path";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { brandTheme, companyConfig, getCompanyAddressLines } from "@/lib/company";
import {
  buildScooterDescription,
  formatCurrency,
  formatDate,
  formatDueDate,
  formatPercent,
} from "@/lib/invoice-formatting";
import type { Invoice } from "@/types/invoice";

const logoPath = path.join(process.cwd(), "public", "go-bike-logo.png");
const LOGO_ASPECT_RATIO = 1667 / 943;
const LOGO_HEIGHT = 52;

const borderColor = "#d4d4d4";
const headerBg = "#f5f5f5";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#171717",
    backgroundColor: "#ffffff",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: borderColor,
  },
  invoiceBlock: {
    alignItems: "flex-end",
  },
  invoiceLabel: {
    fontSize: 9,
    color: "#737373",
    marginBottom: 4,
    textAlign: "right",
  },
  invoiceNumber: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "right",
  },
  companyBlock: {
    alignItems: "flex-start",
    maxWidth: 240,
  },
  logo: {
    height: LOGO_HEIGHT,
    width: LOGO_HEIGHT * LOGO_ASPECT_RATIO,
    objectFit: "contain",
    objectPosition: "left center",
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  companyName: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
  },
  companyLine: {
    fontSize: 8,
    color: "#525252",
    textAlign: "left",
  },
  infoBox: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor,
    marginBottom: 0,
  },
  infoColumn: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: borderColor,
    padding: 10,
  },
  infoColumnLast: {
    flex: 1,
    padding: 10,
  },
  infoTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#737373",
    textTransform: "uppercase",
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  infoText: {
    fontSize: 8,
    lineHeight: 1.5,
    marginBottom: 3,
  },
  infoBold: {
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 3,
  },
  table: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: headerBg,
    borderBottomWidth: 1,
    borderBottomColor: borderColor,
  },
  th: {
    padding: 8,
    fontSize: 8,
    fontWeight: "bold",
    color: "#404040",
    borderRightWidth: 1,
    borderRightColor: borderColor,
  },
  thLast: {
    padding: 8,
    fontSize: 8,
    fontWeight: "bold",
    color: "#404040",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: borderColor,
    minHeight: 48,
  },
  td: {
    padding: 8,
    fontSize: 8,
    lineHeight: 1.45,
    borderRightWidth: 1,
    borderRightColor: borderColor,
  },
  tdLast: {
    padding: 8,
    fontSize: 8,
  },
  colProduct: { width: "22%" },
  colDesc: { width: "38%" },
  colQty: { width: "10%", textAlign: "center" },
  colPrice: { width: "15%", textAlign: "right" },
  colAmount: { width: "15%", textAlign: "right" },
  totalsWrap: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor,
    padding: 14,
  },
  totalsBox: {
    width: 180,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 8,
    color: "#525252",
  },
  totalValue: {
    fontSize: 8,
    fontWeight: "bold",
  },
  totalDivider: {
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    marginTop: 4,
    marginBottom: 4,
    paddingTop: 4,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: "bold",
  },
  balanceValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: brandTheme.primary,
  },
  footer: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: borderColor,
    textAlign: "center",
    fontSize: 8,
    color: "#737373",
  },
});

function InfoColumnPdf({
  title,
  children,
  last = false,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <View style={last ? styles.infoColumnLast : styles.infoColumn}>
      <Text style={styles.infoTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function InvoiceDocument({ invoice }: { invoice: Invoice }) {
  const description = buildScooterDescription({
    scooterCondition: invoice.scooterCondition,
    warrantyDuration: invoice.warrantyDuration,
  });
  const addressLines = getCompanyAddressLines();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.topRow}>
          <View style={styles.companyBlock}>
            {companyConfig.logoExists ? (
              // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf Image has no alt prop
              <Image src={logoPath} style={styles.logo} />
            ) : null}
            <Text style={styles.companyName}>{companyConfig.name}</Text>
            {addressLines.map((line) => (
              <Text key={line} style={styles.companyLine}>
                {line}
              </Text>
            ))}
            {companyConfig.phone ? (
              <Text style={styles.companyLine}>{companyConfig.phone}</Text>
            ) : null}
          </View>

          <View style={styles.invoiceBlock}>
            <Text style={styles.invoiceLabel}>Factuur</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <InfoColumnPdf title="Factuurgegevens">
            <Text style={styles.infoText}>
              Factuurdatum: {formatDate(invoice.invoiceDate)}
            </Text>
            <Text style={styles.infoText}>
              Vervaldatum: {formatDueDate(invoice.invoiceDate)}
            </Text>
            <Text style={styles.infoBold}>
              Te betalen: {formatCurrency(invoice.total)}
            </Text>
          </InfoColumnPdf>

          <InfoColumnPdf title="Leverancier">
            <Text style={styles.infoBold}>{companyConfig.name}</Text>
            {addressLines.map((line) => (
              <Text key={line} style={styles.infoText}>
                {line}
              </Text>
            ))}
            {companyConfig.phone ? (
              <Text style={styles.infoText}>Tel: {companyConfig.phone}</Text>
            ) : null}
          </InfoColumnPdf>

          <InfoColumnPdf title="Factureren aan" last>
            <Text style={styles.infoBold}>{invoice.customerName}</Text>
            <Text style={styles.infoText}>ID: {invoice.identificationNumber}</Text>
            <Text style={styles.infoText}>{invoice.email}</Text>
            <Text style={styles.infoText}>Tel: {invoice.phone}</Text>
          </InfoColumnPdf>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.colProduct]}>Product</Text>
            <Text style={[styles.th, styles.colDesc]}>Omschrijving</Text>
            <Text style={[styles.th, styles.colQty]}>Aantal</Text>
            <Text style={[styles.th, styles.colPrice]}>Prijs</Text>
            <Text style={[styles.thLast, styles.colAmount]}>Bedrag</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.td, styles.colProduct]}>{invoice.scooterType}</Text>
            <Text style={[styles.td, styles.colDesc]}>{description}</Text>
            <Text style={[styles.td, styles.colQty]}>1</Text>
            <Text style={[styles.td, styles.colPrice]}>
              {formatCurrency(invoice.priceExVat)}
            </Text>
            <Text style={[styles.tdLast, styles.colAmount]}>
              {formatCurrency(invoice.priceExVat)}
            </Text>
          </View>
        </View>

        <View style={styles.totalsWrap}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotaal excl. btw</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(invoice.priceExVat)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>
                BTW ({formatPercent(invoice.vatRate)})
              </Text>
              <Text style={styles.totalValue}>
                {formatCurrency(invoice.vatAmount)}
              </Text>
            </View>
            <View style={[styles.totalRow, styles.totalDivider]}>
              <Text style={styles.totalLabel}>Totaal incl. btw</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(invoice.total)}
              </Text>
            </View>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Te betalen</Text>
              <Text style={styles.balanceValue}>
                {formatCurrency(invoice.total)}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>Bedankt voor uw aankoop.</Text>
      </Page>
    </Document>
  );
}
