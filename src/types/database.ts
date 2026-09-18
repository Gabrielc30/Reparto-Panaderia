export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      cierre_dia_repartidor: {
        Row: {
          bloqueado_por_disputa: boolean
          estado: string
          fecha: string
          fecha_cierre: string | null
          id: string
          panaderia_id: string
          repartidor_id: string
        }
        Insert: {
          bloqueado_por_disputa?: boolean
          estado?: string
          fecha?: string
          fecha_cierre?: string | null
          id?: string
          panaderia_id: string
          repartidor_id: string
        }
        Update: {
          bloqueado_por_disputa?: boolean
          estado?: string
          fecha?: string
          fecha_cierre?: string | null
          id?: string
          panaderia_id?: string
          repartidor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cierre_dia_repartidor_panaderia_id_fkey"
            columns: ["panaderia_id"]
            isOneToOne: false
            referencedRelation: "panaderias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cierre_dia_repartidor_repartidor_id_fkey"
            columns: ["repartidor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cierres_local: {
        Row: {
          fecha: string
          id: string
          observaciones: string | null
          pan_suelto_sobrante_kg: number
          panaderia_id: string
          responsable_id: string
        }
        Insert: {
          fecha?: string
          id?: string
          observaciones?: string | null
          pan_suelto_sobrante_kg?: number
          panaderia_id: string
          responsable_id: string
        }
        Update: {
          fecha?: string
          id?: string
          observaciones?: string | null
          pan_suelto_sobrante_kg?: number
          panaderia_id?: string
          responsable_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cierres_local_panaderia_id_fkey"
            columns: ["panaderia_id"]
            isOneToOne: false
            referencedRelation: "panaderias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cierres_local_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          condicion_pago: string
          contacto: string | null
          created_at: string
          direccion: string | null
          id: string
          nombre_negocio: string
          panaderia_id: string
          saldo_actual: number
        }
        Insert: {
          condicion_pago?: string
          contacto?: string | null
          created_at?: string
          direccion?: string | null
          id?: string
          nombre_negocio: string
          panaderia_id: string
          saldo_actual?: number
        }
        Update: {
          condicion_pago?: string
          contacto?: string | null
          created_at?: string
          direccion?: string | null
          id?: string
          nombre_negocio?: string
          panaderia_id?: string
          saldo_actual?: number
        }
        Relationships: [
          {
            foreignKeyName: "clients_panaderia_id_fkey"
            columns: ["panaderia_id"]
            isOneToOne: false
            referencedRelation: "panaderias"
            referencedColumns: ["id"]
          },
        ]
      }
      deliveries: {
        Row: {
          cliente_id: string
          created_at: string
          fecha_hora: string
          id: string
          monto_total: number
          observaciones: string | null
          panaderia_id: string
          repartidor_id: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          fecha_hora?: string
          id?: string
          monto_total?: number
          observaciones?: string | null
          panaderia_id: string
          repartidor_id: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          fecha_hora?: string
          id?: string
          monto_total?: number
          observaciones?: string | null
          panaderia_id?: string
          repartidor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_panaderia_id_fkey"
            columns: ["panaderia_id"]
            isOneToOne: false
            referencedRelation: "panaderias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_repartidor_id_fkey"
            columns: ["repartidor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_edits: {
        Row: {
          campo_modificado: string
          delivery_item_id: string
          editado_por_id: string
          fecha_edicion: string
          id: string
          motivo: string
          valor_anterior: string | null
          valor_nuevo: string | null
        }
        Insert: {
          campo_modificado: string
          delivery_item_id: string
          editado_por_id: string
          fecha_edicion?: string
          id?: string
          motivo: string
          valor_anterior?: string | null
          valor_nuevo?: string | null
        }
        Update: {
          campo_modificado?: string
          delivery_item_id?: string
          editado_por_id?: string
          fecha_edicion?: string
          id?: string
          motivo?: string
          valor_anterior?: string | null
          valor_nuevo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_edits_delivery_item_id_fkey"
            columns: ["delivery_item_id"]
            isOneToOne: false
            referencedRelation: "delivery_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_edits_editado_por_id_fkey"
            columns: ["editado_por_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_items: {
        Row: {
          cantidad: number
          cantidad_retirada: number | null
          delivery_id: string
          forma_pago: string | null
          id: string
          precio_unitario: number | null
          producto_id: string
          tipo_movimiento: string
        }
        Insert: {
          cantidad: number
          cantidad_retirada?: number | null
          delivery_id: string
          forma_pago?: string | null
          id?: string
          precio_unitario?: number | null
          producto_id: string
          tipo_movimiento: string
        }
        Update: {
          cantidad?: number
          cantidad_retirada?: number | null
          delivery_id?: string
          forma_pago?: string | null
          id?: string
          precio_unitario?: number | null
          producto_id?: string
          tipo_movimiento?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_items_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_items_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      dispatch_items: {
        Row: {
          cantidad_confirmada_repartidor: number | null
          cantidad_despachada_panadero: number
          dispatch_id: string
          id: string
          producto_id: string
        }
        Insert: {
          cantidad_confirmada_repartidor?: number | null
          cantidad_despachada_panadero: number
          dispatch_id: string
          id?: string
          producto_id: string
        }
        Update: {
          cantidad_confirmada_repartidor?: number | null
          cantidad_despachada_panadero?: number
          dispatch_id?: string
          id?: string
          producto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispatch_items_dispatch_id_fkey"
            columns: ["dispatch_id"]
            isOneToOne: false
            referencedRelation: "dispatches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatch_items_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      dispatches: {
        Row: {
          comentario_admin: string | null
          comentario_repartidor: string | null
          created_at: string
          estado: string
          fecha: string
          fecha_confirmacion: string | null
          fecha_resolucion: string | null
          id: string
          panaderia_id: string
          panadero_id: string
          repartidor_id: string
        }
        Insert: {
          comentario_admin?: string | null
          comentario_repartidor?: string | null
          created_at?: string
          estado?: string
          fecha?: string
          fecha_confirmacion?: string | null
          fecha_resolucion?: string | null
          id?: string
          panaderia_id: string
          panadero_id: string
          repartidor_id: string
        }
        Update: {
          comentario_admin?: string | null
          comentario_repartidor?: string | null
          created_at?: string
          estado?: string
          fecha?: string
          fecha_confirmacion?: string | null
          fecha_resolucion?: string | null
          id?: string
          panaderia_id?: string
          panadero_id?: string
          repartidor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispatches_panaderia_id_fkey"
            columns: ["panaderia_id"]
            isOneToOne: false
            referencedRelation: "panaderias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatches_panadero_id_fkey"
            columns: ["panadero_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatches_repartidor_id_fkey"
            columns: ["repartidor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      local_dispatches: {
        Row: {
          cantidad: number
          created_at: string
          fecha: string
          id: string
          observaciones: string | null
          panaderia_id: string
          panadero_id: string
          producto_id: string
        }
        Insert: {
          cantidad: number
          created_at?: string
          fecha?: string
          id?: string
          observaciones?: string | null
          panaderia_id: string
          panadero_id: string
          producto_id: string
        }
        Update: {
          cantidad?: number
          created_at?: string
          fecha?: string
          id?: string
          observaciones?: string | null
          panaderia_id?: string
          panadero_id?: string
          producto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "local_dispatches_panaderia_id_fkey"
            columns: ["panaderia_id"]
            isOneToOne: false
            referencedRelation: "panaderias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "local_dispatches_panadero_id_fkey"
            columns: ["panadero_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "local_dispatches_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      panaderias: {
        Row: {
          activo: boolean
          created_at: string
          id: string
          nombre: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          id?: string
          nombre: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          cliente_id: string
          fecha: string
          forma_pago: string
          id: string
          monto: number
          panaderia_id: string
          registrado_por_id: string
        }
        Insert: {
          cliente_id: string
          fecha?: string
          forma_pago: string
          id?: string
          monto: number
          panaderia_id: string
          registrado_por_id: string
        }
        Update: {
          cliente_id?: string
          fecha?: string
          forma_pago?: string
          id?: string
          monto?: number
          panaderia_id?: string
          registrado_por_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_panaderia_id_fkey"
            columns: ["panaderia_id"]
            isOneToOne: false
            referencedRelation: "panaderias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_registrado_por_id_fkey"
            columns: ["registrado_por_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      produccion_insumos: {
        Row: {
          cantidad: number
          created_at: string
          id: string
          insumo_id: string
          produccion_id: string
          producto_id: string
          unidad_medida: string
        }
        Insert: {
          cantidad: number
          created_at?: string
          id?: string
          insumo_id: string
          produccion_id: string
          producto_id: string
          unidad_medida: string
        }
        Update: {
          cantidad?: number
          created_at?: string
          id?: string
          insumo_id?: string
          produccion_id?: string
          producto_id?: string
          unidad_medida?: string
        }
        Relationships: [
          {
            foreignKeyName: "produccion_insumos_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produccion_insumos_produccion_id_fkey"
            columns: ["produccion_id"]
            isOneToOne: false
            referencedRelation: "producciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produccion_insumos_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      produccion_resultados: {
        Row: {
          cantidad_obtenida: number
          created_at: string
          id: string
          produccion_id: string
          producto_id: string
          unidad_medida: string
        }
        Insert: {
          cantidad_obtenida: number
          created_at?: string
          id?: string
          produccion_id: string
          producto_id: string
          unidad_medida: string
        }
        Update: {
          cantidad_obtenida?: number
          created_at?: string
          id?: string
          produccion_id?: string
          producto_id?: string
          unidad_medida?: string
        }
        Relationships: [
          {
            foreignKeyName: "produccion_resultados_produccion_id_fkey"
            columns: ["produccion_id"]
            isOneToOne: false
            referencedRelation: "producciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produccion_resultados_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      producciones: {
        Row: {
          created_at: string
          estado: string
          fecha: string
          fecha_coccion: string | null
          id: string
          panaderia_id: string
          panadero_id: string
          turno_id: string
        }
        Insert: {
          created_at?: string
          estado?: string
          fecha?: string
          fecha_coccion?: string | null
          id?: string
          panaderia_id: string
          panadero_id: string
          turno_id: string
        }
        Update: {
          created_at?: string
          estado?: string
          fecha?: string
          fecha_coccion?: string | null
          id?: string
          panaderia_id?: string
          panadero_id?: string
          turno_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "producciones_panaderia_id_fkey"
            columns: ["panaderia_id"]
            isOneToOne: false
            referencedRelation: "panaderias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "producciones_panadero_id_fkey"
            columns: ["panadero_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "producciones_turno_id_fkey"
            columns: ["turno_id"]
            isOneToOne: false
            referencedRelation: "turnos_produccion"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          id: string
          nombre: string
          panaderia_id: string
          precio_unitario: number
          stock: number
          tipo: string
          unidad_medida: string
        }
        Insert: {
          created_at?: string
          id?: string
          nombre: string
          panaderia_id: string
          precio_unitario?: number
          stock?: number
          tipo?: string
          unidad_medida?: string
        }
        Update: {
          created_at?: string
          id?: string
          nombre?: string
          panaderia_id?: string
          precio_unitario?: number
          stock?: number
          tipo?: string
          unidad_medida?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_panaderia_id_fkey"
            columns: ["panaderia_id"]
            isOneToOne: false
            referencedRelation: "panaderias"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_conversions: {
        Row: {
          bolsas_viejas_usadas: number
          created_at: string
          fecha: string
          id: string
          observaciones: string | null
          pan_rallado_obtenido_kg: number
          pan_suelto_usado_kg: number
          panaderia_id: string
          responsable_id: string
        }
        Insert: {
          bolsas_viejas_usadas?: number
          created_at?: string
          fecha?: string
          id?: string
          observaciones?: string | null
          pan_rallado_obtenido_kg?: number
          pan_suelto_usado_kg?: number
          panaderia_id: string
          responsable_id: string
        }
        Update: {
          bolsas_viejas_usadas?: number
          created_at?: string
          fecha?: string
          id?: string
          observaciones?: string | null
          pan_rallado_obtenido_kg?: number
          pan_suelto_usado_kg?: number
          panaderia_id?: string
          responsable_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_conversions_panaderia_id_fkey"
            columns: ["panaderia_id"]
            isOneToOne: false
            referencedRelation: "panaderias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_conversions_responsable_id_fkey"
            columns: ["responsable_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      turnos_produccion: {
        Row: {
          activo: boolean
          created_at: string
          id: string
          nombre: string
          orden: number
          panaderia_id: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          id?: string
          nombre: string
          orden?: number
          panaderia_id: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          id?: string
          nombre?: string
          orden?: number
          panaderia_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "turnos_produccion_panaderia_id_fkey"
            columns: ["panaderia_id"]
            isOneToOne: false
            referencedRelation: "panaderias"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string | null
          estado: string
          id: string
          nombre: string
          panaderia_id: string
          rol: string
          telefono: string | null
          zona_asignada: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          estado?: string
          id: string
          nombre: string
          panaderia_id: string
          rol: string
          telefono?: string | null
          zona_asignada?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          estado?: string
          id?: string
          nombre?: string
          panaderia_id?: string
          rol?: string
          telefono?: string | null
          zona_asignada?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_panaderia_id_fkey"
            columns: ["panaderia_id"]
            isOneToOne: false
            referencedRelation: "panaderias"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      aplicar_conversion_pan_rallado: {
        Args: {
          p_bolsas_viejas_usadas: number
          p_observaciones: string
          p_pan_rallado_obtenido_kg: number
          p_pan_suelto_usado_kg: number
          p_panaderia_id: string
          p_producto_rallado_id: string
          p_producto_suelto_id: string
          p_producto_viejo_id: string
          p_responsable_id: string
        }
        Returns: {
          bolsas_viejas_usadas: number
          created_at: string
          fecha: string
          id: string
          observaciones: string | null
          pan_rallado_obtenido_kg: number
          pan_suelto_usado_kg: number
          panaderia_id: string
          responsable_id: string
        }
      }
      auth_panaderia_id: { Args: never; Returns: string }
      auth_rol: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
