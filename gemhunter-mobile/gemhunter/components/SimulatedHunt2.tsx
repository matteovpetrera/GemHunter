import { Attraction } from "@/constants/Attraction";
import { setFound } from "@/dao/attractionsDao";
import { router } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ImageBackground,
  Image,
  ScrollView,
} from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

interface ItineraryPoint {
  lat: number;
  lon: number;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface SimulatedHuntProps {
  attractions: Attraction[];
  itinerary: Attraction[];
  userLocation: UserLocation;
  onExit: () => void;
}

const SimulatedHunt: React.FC<SimulatedHuntProps> = ({
  attractions,
  itinerary,
  userLocation,
  onExit,
}) => {
  const [simulatedPosition, setSimulatedPosition] = useState(userLocation);
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [isMoving, setIsMoving] = useState(false);
  const [speed, setSpeed] = useState(1000); // Velocità in millisecondi
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal1, setShowModal1] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [modal1Showed, setModal1Showed] = useState(false);
  const [modal2Showed, setModal2Showed] = useState(false);
  const imageMapping = {
    "mole_icon.jpg": require("../assets/images/mole_icon.jpg"),
    "madama_icon.jpg": require("../assets/images/madama_icon.jpg"),
    "granmadre_icon.jpg": require("../assets/images/granmadre_icon.jpg"),
    "innamorati_icon.jpg": require("../assets/images/innamorati_icon.jpg"),
    "testa_icon.jpg": require("../assets/images/testa_icon.jpg"),
    "piazza-san-carlo.jpg": require("../assets/images/piazza-san-carlo.jpg"),
    "fetta-polenta.jpg": require("../assets/images/fetta-polenta.jpg"),
    "portone-melograno.jpg": require("../assets/images/portone-melograno.jpg"),
    "monumento-vittorio.jpg": require("../assets/images/monumento-vittorio.jpg"),
  };
  const apiKey = process.env.GOOGLE_API_KEY || "YOUR_DEFAULT_API_KEY";

  const FAKE_COORDS = [{ latitude: 45.0505366, longitude: 7.6812146 }];
  useEffect(() => {
    if (!isMoving || currentIndex >= routeCoords.length) return;

    const timeout = setTimeout(() => {
      setSimulatedPosition(routeCoords[currentIndex]);
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }, speed);

    return () => clearTimeout(timeout);
  }, [isMoving, currentIndex, routeCoords, speed]);

  useEffect(() => {
    const tolerance = 0.001;
    if (
      Math.abs(simulatedPosition.latitude - (FAKE_COORDS.at(0)?.latitude ?? 0)) <= tolerance &&
      Math.abs(simulatedPosition.longitude - (FAKE_COORDS.at(0)?.longitude ?? 0)) <= tolerance
    ) {
      !modal1Showed ? setShowModal1(true) : null;
      setModal1Showed(true);
    }

    if (
      Math.abs(simulatedPosition.latitude - (itinerary[itinerary.length - 1].lat ?? 0)) <=
        tolerance &&
      Math.abs(simulatedPosition.longitude - (itinerary[itinerary.length - 1].lon ?? 0)) <=
        tolerance
    ) {
      setShowModal1(false);
      !modal2Showed ? setShowModal2(true) : null;
      setModal2Showed(true);
      setFound(itinerary[0].id as number);
    }
  }, [simulatedPosition]);

  const closeModal = () => {
    setShowModal1(false);
  };

  const closeSimu = () => {
    setShowModal2(false);
    onExit();
  };

  const renderMarker = (attraction: Attraction) => {
    if (attraction.isGem === 1 && attraction.isFound === 0) {
      return (
        <>
          <Circle
            key={`circle-${attraction.id}`} // <== AGGIUNGI key UNIVOCO
            center={{ latitude: attraction.lat, longitude: attraction.lon }}
            radius={300}
            strokeColor="darkgreen"
            fillColor="rgba(0, 128, 0, 0.6)"
          />
          <Marker
            key={`marker-${attraction.id}`} // <== AGGIUNGI key UNIVOCO
            coordinate={{ latitude: attraction.lat, longitude: attraction.lon }}
            image={require("../assets/images/gem_center.png")}
          />
        </>
      );
    } else if (attraction.isGem === 0) {
      return (
        <Marker
          key={`marker-${attraction.id}`} // <== AGGIUNGI key UNIVOCO
          coordinate={{ latitude: attraction.lat, longitude: attraction.lon }}
          image={require("../assets/images/monument.png")}
        />
      );
    } else if (attraction.isGem === 1 && attraction.isFound === 1) {
      return (
        <Marker
          key={`marker-${attraction.id}`} // <== AGGIUNGI key UNIVOCO
          coordinate={{ latitude: attraction.lat, longitude: attraction.lon }}
          image={require("../assets/images/gem_marker.png")}
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      {showModal1 && (
        <Modal
          visible={showModal1}
          animationType="slide"
          transparent={true}
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modal1Title}>Hunter, you're in the right spot!</Text>
              <Text style={styles.modalDescription}>A gem is hidden nearby, go find it!</Text>

              <TouchableOpacity style={styles.closeButton} onPress={() => setShowModal1(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
      {showModal2 && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showModal2}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContentGemFound}>
              <ImageBackground
                source={require("../assets/images/gem_background4.png")}
                style={styles.modalBackgroundImage}
                imageStyle={{ borderRadius: 20 }}
              >
                <Image
                  source={imageMapping[itinerary.at(0)?.icon as keyof typeof imageMapping]}
                  style={styles.attractionImage}
                />
                <Text style={styles.attractionTitle}>
                  {itinerary.at(0)?.name ?? "Unknow Attraction"}
                </Text>
                <View style={styles.descriptionContainer}>
                  <ScrollView style={styles.descriptionScroll}>
                    <Text style={styles.attractionDescription}>
                      {itinerary.at(0)?.description.replace(/\\'/g, "'")}
                    </Text>
                  </ScrollView>
                </View>
                <TouchableOpacity style={styles.closeButton} onPress={closeSimu}>
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </ImageBackground>
            </View>
          </View>
        </Modal>
      )}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsCompass={false}
      >
        {/* Renderizza i marker per le attrazioni */}
        {attractions.map((attraction) => (
          <React.Fragment key={attraction.id}>{renderMarker(attraction)}</React.Fragment>
        ))}
        <MapViewDirections
          origin={userLocation}
          waypoints={FAKE_COORDS}
          destination={{
            latitude: itinerary[itinerary.length - 1].lat,
            longitude: itinerary[itinerary.length - 1].lon,
          }}
          apikey={apiKey}
          strokeWidth={2}
          strokeColor="transparent"
          mode="WALKING"
          lineDashPattern={[3]}
          onReady={(result) => {
            setRouteCoords(result.coordinates);
          }}
        />
        {/* Marker della posizione simulata */}
        <Marker coordinate={simulatedPosition} title="User">
          <View style={styles.userMarker}>
            <View style={styles.innerCircle} />
          </View>
        </Marker>
      </MapView>

      <TouchableOpacity style={styles.startButton} onPress={() => setIsMoving(!isMoving)}>
        <Text style={styles.buttonText}>{isMoving ? "Pause" : "Start"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.exitButton} onPress={onExit}>
        <Text style={styles.buttonText}>Exit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  userMarker: {
    width: 25,
    height: 25,
    borderRadius: 25,
    backgroundColor: "rgba(0, 122, 255, 0.3)", // Azzurro trasparente
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  innerCircle: {
    width: 18,
    height: 18,
    borderRadius: 15,
    backgroundColor: "#007AFF", // Azzurro di iOS/Google Maps
  },
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  descriptionContainer: {
    borderWidth: 2,
    borderColor: "gray",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    backgroundColor: "white",
  },
  descriptionScroll: {
    maxHeight: 200,
  },
  attractionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "black",
    marginVertical: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  attractionImage: {
    width: "100%",
    height: 150,
    borderRadius: 15,
  },
  attractionDescription: {
    fontSize: 16,
    textAlign: "center",
    color: "black",
    margin: 20,
  },
  startButton: {
    position: "absolute",
    bottom: 100,
    left: 30,
    width: 100,
    height: 40,
    alignItems: "center",
    backgroundColor: "green",
    padding: 10,
    borderRadius: 30,
  },
  exitButton: {
    position: "absolute",
    bottom: 100,
    right: 30,
    backgroundColor: "red",
    width: 100,
    height: 40,
    alignItems: "center",
    padding: 10,
    borderRadius: 30,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  modalContentGemFound: {
    width: "85%",
    borderRadius: 20,
    overflow: "hidden", // Necessario per far sì che i bordi arrotondati vengano applicati correttamente all'ImageBackground
    elevation: 5, // Ombra per Android
    shadowColor: "#000", // Ombra per iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalContent: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 5, // Ombra per Android
    shadowColor: "#000", // Ombra per iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalBackgroundImage: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalImage: { width: "100%", height: 150, borderRadius: 15, marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  modal1Title: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  modalDescription: { fontSize: 16, textAlign: "center", marginBottom: 20, paddingInline: 30 },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  closeButton: {
    width: "80%",
    backgroundColor: "black",
    borderRadius: 30,
    elevation: 4, // Per ombre su Android
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: { color: "white", fontSize: 16 },
  imageBlurred: {
    opacity: 0.3,
  },
});

export default SimulatedHunt;
