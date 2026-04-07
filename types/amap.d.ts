// Type declarations for Amap JS API

declare module '@amap/amap-jsapi-loader' {
  interface LoaderOptions {
    key: string
    version: string
    plugins?: string[]
    AMapUI?: {
      version?: string
      plugins?: string[]
    }
    Loca?: {
      version?: string
    }
  }

  export default class AMapLoader {
    static load(options: LoaderOptions): Promise<typeof AMap>
  }
}

// AMap global types
declare global {
  namespace AMap {
    class Map {
      constructor(container: string | HTMLElement, options?: MapOptions)
      destroy(): void
      setZoomAndCenter(zoom: number, center: [number, number]): void
      setMapStyle(style: string): void
      add(overlays: any | any[]): void
      remove(overlays: any | any[]): void
      addControl(control: any): void
      removeControl(control: any): void
      setCenter(center: [number, number]): void
      setZoom(zoom: number): void
      getCenter(): LngLat
      getZoom(): number
      on(event: string, callback: (...args: any[]) => void): void
      off(event: string, callback: (...args: any[]) => void): void
    }

    interface MapOptions {
      zoom?: number
      center?: [number, number] | LngLat
      viewMode?: '2D' | '3D'
      mapStyle?: string
      pitch?: number
      rotation?: number
      features?: string[]
      showBuildingBlock?: boolean
      showIndoorMap?: boolean
    }

    class LngLat {
      constructor(lng: number, lat: number)
      getLng(): number
      getLat(): number
    }

    class Pixel {
      constructor(x: number, y: number)
      getX(): number
      getY(): number
    }

    class Marker {
      constructor(options: MarkerOptions)
      setMap(map: Map | null): void
      getMap(): Map | null
      setPosition(position: [number, number] | LngLat): void
      getPosition(): LngLat
      setContent(content: string | HTMLElement): void
      setAnchor(anchor: string): void
      setOffset(offset: Pixel): void
      on(event: string, callback: (...args: any[]) => void): void
      off(event: string, callback: (...args: any[]) => void): void
    }

    interface MarkerOptions {
      position?: [number, number] | LngLat
      content?: string | HTMLElement
      anchor?: string
      offset?: Pixel
      title?: string
      clickable?: boolean
      draggable?: boolean
      visible?: boolean
      zIndex?: number
      angle?: number
      animation?: string
      shadow?: Icon | string
      shape?: MarkerShape
      extData?: any
    }

    class Icon {
      constructor(options: IconOptions)
      setImageSize(size: Size): void
      getImageSize(): Size
    }

    interface IconOptions {
      size?: Size
      image?: string
      imageOffset?: Pixel
      imageSize?: Size
    }

    class Size {
      constructor(width: number, height: number)
      getWidth(): number
      getHeight(): number
    }

    interface MarkerShape {
      coords?: number[]
      type?: string
    }

    class Polygon {
      constructor(options: PolygonOptions)
      setMap(map: Map | null): void
      getMap(): Map | null
      setPath(path: number[][] | LngLat[]): void
      getPath(): LngLat[]
      setOptions(options: PolygonOptions): void
      hide(): void
      show(): void
      setExtData(extData: any): void
      getExtData(): any
      on(event: string, callback: (...args: any[]) => void): void
      off(event: string, callback: (...args: any[]) => void): void
    }

    interface PolygonOptions {
      path?: number[][] | LngLat[]
      strokeColor?: string
      strokeOpacity?: number
      strokeWeight?: number
      strokeStyle?: string
      strokeDasharray?: number[]
      fillColor?: string
      fillOpacity?: number
      zIndex?: number
      bubble?: boolean
      extData?: any
    }

    class InfoWindow {
      constructor(options: InfoWindowOptions)
      open(map: Map, position: [number, number] | LngLat): void
      close(): void
      setContent(content: string | HTMLElement): void
      getContent(): string | HTMLElement
      setPosition(position: [number, number] | LngLat): void
      getPosition(): LngLat
      setSize(size: Size): void
      getSize(): Size
    }

    interface InfoWindowOptions {
      content?: string | HTMLElement
      position?: [number, number] | LngLat
      size?: Size
      offset?: Pixel
      isCustom?: boolean
      closeWhenClickMap?: boolean
      showShadow?: boolean
    }

    class Scale {
      constructor(options?: ScaleOptions)
    }

    interface ScaleOptions {
      visible?: boolean
      position?: string
    }

    class ToolBar {
      constructor(options?: ToolBarOptions)
    }

    interface ToolBarOptions {
      visible?: boolean
      position?: string
      offset?: Pixel
      ruler?: boolean
      direction?: boolean
      locate?: boolean
    }

    class MapType {
      constructor(options?: MapTypeOptions)
    }

    interface MapTypeOptions {
      defaultType?: number
      showTraffic?: boolean
      showRoad?: boolean
    }

    class Geolocation {
      constructor(options?: GeolocationOptions)
      getCurrentPosition(callback: (status: string, result: any) => void): void
      getCityInfo(callback: (status: string, result: any) => void): void
    }

    interface GeolocationOptions {
      enableHighAccuracy?: boolean
      timeout?: number
      noIpLocate?: number
      noGeoLocation?: number
      GeoLocationFirst?: boolean
      maximumAge?: number
      convert?: boolean
      showButton?: boolean
      buttonPosition?: string
      buttonOffset?: Pixel
      panToLocation?: boolean
      zoomToAccuracy?: boolean
      extensions?: string
    }

    class PlaceSearch {
      constructor(options?: PlaceSearchOptions)
      search(keyword: string, callback: (status: string, result: any) => void): void
      searchNearBy(
        keyword: string,
        center: [number, number] | LngLat,
        radius: number,
        callback: (status: string, result: any) => void
      ): void
      setPageIndex(pageIndex: number): void
      setPageSize(pageSize: number): void
      setCity(city: string): void
      setType(type: string): void
      clear(): void
    }

    interface PlaceSearchOptions {
      pageSize?: number
      pageIndex?: number
      city?: string
      citylimit?: boolean
      type?: string
      extensions?: string
    }
  }
}

export {}
