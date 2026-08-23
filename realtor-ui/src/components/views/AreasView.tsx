import React, { useState, useEffect } from 'react';
import { YStack, XStack, Text, Button, Input } from 'tamagui';
import { Point, SavedArea } from '../../services/map/MapProviderInterface';
import { MapServiceFactory } from '../../services/map/MapServiceFactory';

export interface AreasViewProps {
  unit?: 'kilometers' | 'miles';
  radius?: number;
  savedAreas?: SavedArea[];
  onSaveArea?: (area: { name: string; polygon: Point[] }) => Promise<void> | void;
  onDeleteArea?: (id: string) => Promise<void> | void;
}

export const AreasView: React.FC<AreasViewProps> = ({
  unit = 'kilometers',
  radius = 50,
  savedAreas = [],
  onSaveArea,
  onDeleteArea,
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [areaName, setAreaName] = useState('');
  const [currentPolygon, setCurrentPolygon] = useState<Point[]>([]);
  const [userLocation, setUserLocation] = useState<Point>({ lat: 37.7749, lng: -122.4194 });
  const [areasList, setAreasList] = useState<SavedArea[]>(savedAreas);

  useEffect(() => {
    setAreasList(savedAreas);
  }, [savedAreas]);

  // Geolocation detection with fallback
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {},
        { timeout: 3000 }
      );
    }
  }, []);

  // Calculate zoom level from radius & unit
  const radiusKm = unit === 'miles' ? radius * 1.60934 : radius;
  const zoomLevel = Math.max(4, Math.min(18, Math.round(14 - Math.log2(Math.max(1, radiusKm) / 5))));

  const handleStartDrawing = () => {
    setIsDrawing(true);
    setCurrentPolygon([]);
    setAreaName(`Search Area ${areasList.length + 1}`);
  };

  const handleFinishDrawing = async () => {
    if (currentPolygon.length >= 3) {
      const newArea = {
        id: `area-${Date.now()}`,
        name: areaName || `Area ${areasList.length + 1}`,
        polygon: [...currentPolygon],
      };

      if (onSaveArea) {
        await onSaveArea({ name: newArea.name, polygon: newArea.polygon });
      }

      setAreasList((prev) => [...prev, newArea]);
    }
    setIsDrawing(false);
    setCurrentPolygon([]);
  };

  const handleAddPoint = (pt: Point) => {
    setCurrentPolygon((prev) => [...prev, pt]);
  };

  const handleUndoPoint = () => {
    setCurrentPolygon((prev) => prev.slice(0, -1));
  };

  const handleDelete = async (id: string) => {
    if (onDeleteArea) {
      await onDeleteArea(id);
    }
    setAreasList((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <YStack testID="areas-view-container" gap="$4" width="100%">
      <XStack justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$3">
        <YStack gap="$1">
          <Text fontSize={24} fontWeight="800" color="#0f172a">
            Property Search Areas
          </Text>
          <Text fontSize={14} color="#64748b">
            Select, draw, and manage target property search regions on Google Maps.
          </Text>
        </YStack>

        <XStack gap="$3" alignItems="center">
          {isDrawing && (
            <Input
              testID="area-name-input"
              value={areaName}
              onChangeText={setAreaName}
              placeholder="Area Name..."
              borderColor="#cbd5e1"
              height={40}
              width={180}
            />
          )}

          <Button
            testID={isDrawing ? 'finish-area-button' : 'new-area-button'}
            backgroundColor={isDrawing ? '#16a34a' : '#2563eb'}
            hoverStyle={{ backgroundColor: isDrawing ? '#15803d' : '#1d4ed8' }}
            onPress={isDrawing ? handleFinishDrawing : handleStartDrawing}
            borderRadius="$4"
            paddingHorizontal="$4"
            height={40}
          >
            <Text color="white" fontWeight="700">
              {isDrawing ? 'Finish' : 'New Area'}
            </Text>
          </Button>
        </XStack>
      </XStack>

      {/* Mode Instructions Banner */}
      {isDrawing && (
        <XStack
          testID="drawing-mode-banner"
          backgroundColor="#eff6ff"
          borderColor="#bfdbfe"
          borderWidth={1}
          borderRadius="$4"
          padding="$3"
          alignItems="center"
          justifyContent="space-between"
        >
          <Text fontSize={13} color="#1e40af" fontWeight="600">
            <strong>Area Selection Mode:</strong> Left-click to place polygon points. Right-click to <strong>Undo</strong> last point. Double-click to <strong>Finish & Save</strong>.
          </Text>
          <Text fontSize={12} color="#3b82f6" fontWeight="700">
            Points placed: {currentPolygon.length}
          </Text>
        </XStack>
      )}

      <XStack gap="$4" flexWrap="wrap">
        {/* Pluggable Map Component Container via MapServiceFactory */}
        <YStack
          flex={3}
          minWidth={340}
          height={480}
          backgroundColor="#0f172a"
          borderRadius="$5"
          overflow="hidden"
          borderColor="#334155"
          borderWidth={1}
          position="relative"
          elevation="$3"
        >
          <MapServiceFactory
            center={userLocation}
            zoom={zoomLevel}
            unit={unit}
            radius={radius}
            isDrawing={isDrawing}
            savedAreas={areasList}
            currentPolygon={currentPolygon}
            onAddPoint={handleAddPoint}
            onUndoPoint={handleUndoPoint}
            onFinishDrawing={handleFinishDrawing}
          />
        </YStack>

        {/* Saved Areas List Side Panel */}
        <YStack
          flex={1}
          minWidth={280}
          backgroundColor="#ffffff"
          borderRadius="$5"
          padding="$4"
          borderColor="#e2e8f0"
          borderWidth={1}
          elevation="$2"
          gap="$3"
          testID="saved-areas-panel"
        >
          <Text fontSize={16} fontWeight="700" color="#0f172a">
            Saved Search Areas ({areasList.length})
          </Text>

          {areasList.length === 0 ? (
            <YStack padding="$4" alignItems="center" justifyContent="center" gap="$2">
              <Text fontSize={28}>🗺️</Text>
              <Text fontSize={13} color="#64748b" textAlign="center">
                No saved property search areas yet. Click <strong>"New Area"</strong> to define one on the map.
              </Text>
            </YStack>
          ) : (
            <YStack gap="$2">
              {areasList.map((area) => (
                <XStack
                  key={area.id}
                  testID={`area-item-${area.id}`}
                  justifyContent="space-between"
                  alignItems="center"
                  backgroundColor="#f8fafc"
                  padding="$3"
                  borderRadius="$3"
                  borderColor="#e2e8f0"
                  borderWidth={1}
                >
                  <YStack gap="$0.5">
                    <Text fontSize={14} fontWeight="700" color="#0f172a">
                      {area.name}
                    </Text>
                    <Text fontSize={11} color="#64748b">
                      {area.polygon?.length || 0} vertices
                    </Text>
                  </YStack>

                  <Button
                    testID={`delete-area-${area.id}`}
                    size="$2"
                    backgroundColor="#fee2e2"
                    hoverStyle={{ backgroundColor: '#fca5a5' }}
                    onPress={() => handleDelete(area.id)}
                    borderRadius="$2"
                  >
                    <Text color="#dc2626" fontWeight="700" fontSize={12}>
                      Delete
                    </Text>
                  </Button>
                </XStack>
              ))}
            </YStack>
          )}
        </YStack>
      </XStack>
    </YStack>
  );
};

export default AreasView;
