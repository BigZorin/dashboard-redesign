import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { searchByBarcode } from '../../lib/openFoodFacts';
import { theme } from '../../constants/theme';

function getToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export default function BarcodeScannerScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { date, mealType } = route.params || { date: getToday(), mealType: 'SNACK' };

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  // Reset scanner state when screen gets focus (e.g. navigating back from FoodDetail)
  useFocusEffect(
    useCallback(() => {
      setScanned(false);
      setLoading(false);
    }, [])
  );

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);

    const product = await searchByBarcode(data);

    if (product) {
      navigation.navigate('FoodDetail' as never, {
        product,
        date,
        mealType,
      } as never);
    } else {
      Alert.alert(
        'Product niet gevonden',
        `Barcode: ${data}\n\nDit product staat niet in de database. Je kunt het handmatig invoeren.`,
        [
          { text: 'Opnieuw scannen', onPress: () => setScanned(false) },
          {
            text: 'Handmatig invoeren',
            onPress: () =>
              navigation.navigate('AddFood' as never, { date, mealType } as never),
          },
        ]
      );
    }

    setLoading(false);
  };

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Barcode scanner</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={60} color={theme.colors.textTertiary} />
          <Text style={styles.permissionTitle}>Camera toegang nodig</Text>
          <Text style={styles.permissionText}>
            Om barcodes te scannen hebben we toegang tot je camera nodig.
          </Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>Camera toestaan</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.fullContainer}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Overlay */}
      <SafeAreaView style={styles.overlay} edges={['top']}>
        <View style={styles.overlayHeader}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.scanArea}>
          {/* Corner markers */}
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
        </View>

        <View style={styles.overlayBottom}>
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.overlayText}>Product opzoeken...</Text>
            </View>
          ) : (
            <Text style={styles.overlayText}>
              Richt de camera op een barcode
            </Text>
          )}
          {scanned && !loading && (
            <TouchableOpacity
              style={styles.rescanBtn}
              onPress={() => setScanned(false)}
            >
              <Text style={styles.rescanBtnText}>Opnieuw scannen</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  fullContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  // Permission
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 8,
  },
  permissionText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  permissionBtn: {
    marginTop: 16,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Camera overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  overlayHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 260,
    height: 160,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#fff',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  overlayBottom: {
    alignItems: 'center',
    paddingBottom: 60,
    gap: 12,
  },
  overlayText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rescanBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  rescanBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
