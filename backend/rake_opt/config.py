from __future__ import annotations

"""Predefined rake templates and simple helpers.

The actual capacities and dimensions here are approximate and are meant for
experimentation and unit tests, not for production railway design.
"""

from typing import Dict, List

from .models import RakeTemplate


def _boxn_slots() -> List[dict]:
    # Three logical sections to help balancing
    return [
        {
            "id": "front",
            "max_weight_t": 20.0,
            "max_length_m": 4.5,
            "max_width_m": 2.8,
            "max_height_m": 2.8,
        },
        {
            "id": "mid",
            "max_weight_t": 20.0,
            "max_length_m": 4.5,
            "max_width_m": 2.8,
            "max_height_m": 2.8,
        },
        {
            "id": "rear",
            "max_weight_t": 20.0,
            "max_length_m": 4.5,
            "max_width_m": 2.8,
            "max_height_m": 2.8,
        },
    ]


def _brn_slots() -> List[dict]:
    # Flat wagon, two broad sections
    return [
        {
            "id": "front",
            "max_weight_t": 32.0,
            "max_length_m": 6.0,
            "max_width_m": 2.9,
            "max_height_m": 2.0,
        },
        {
            "id": "rear",
            "max_weight_t": 32.0,
            "max_length_m": 6.0,
            "max_width_m": 2.9,
            "max_height_m": 2.0,
        },
    ]


def _bost_slots() -> List[dict]:
    # Tanker style, treated as a single slot here
    return [
        {
            "id": "tank",
            "max_weight_t": 65.0,
            "max_length_m": 12.0,
            "max_width_m": 2.9,
            "max_height_m": 2.9,
        }
    ]


def predefined_templates() -> Dict[str, RakeTemplate]:
    """Return a dictionary of a few standard rake templates.

    IDs are of the form TYPE_RAKE_NWAGONS.
    """

    templates = {
        "BOXNHL_RAKE_58": RakeTemplate(
            id="BOXNHL_RAKE_58",
            wagon_type="BOXNHL",
            num_wagons=58,
            wagon_params={
                "payload_limit_t": 60.0,
                "length_m": 13.0,
                "width_m": 2.8,
                "height_m": 2.8,
                "slots": _boxn_slots(),
            },
        ),
        "BOXN_RAKE_41": RakeTemplate(
            id="BOXN_RAKE_41",
            wagon_type="BOXN",
            num_wagons=41,
            wagon_params={
                "payload_limit_t": 58.0,
                "length_m": 12.5,
                "width_m": 2.8,
                "height_m": 2.8,
                "slots": _boxn_slots(),
            },
        ),
        "BRN_RAKE_43": RakeTemplate(
            id="BRN_RAKE_43",
            wagon_type="BRN",
            num_wagons=43,
            wagon_params={
                "payload_limit_t": 64.0,
                "length_m": 12.0,
                "width_m": 2.9,
                "height_m": 2.0,
                "slots": _brn_slots(),
            },
        ),
        "BOST_RAKE_45": RakeTemplate(
            id="BOST_RAKE_45",
            wagon_type="BOST",
            num_wagons=45,
            wagon_params={
                "payload_limit_t": 70.0,
                "length_m": 12.0,
                "width_m": 2.9,
                "height_m": 2.9,
                "slots": _bost_slots(),
            },
        ),
    }

    return templates


DEFAULT_TEMPLATES: Dict[str, RakeTemplate] = predefined_templates()
